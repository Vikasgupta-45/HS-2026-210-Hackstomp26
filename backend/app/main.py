from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, date, timedelta
import re
import shutil
import os
from typing import List
from urllib.parse import quote

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)


def _ensure_video_call_request_schema():
    """
    Lightweight schema patching for SQLite deployments without migrations.
    Adds scheduled_for column if missing.
    """
    with engine.begin() as conn:
        if conn.dialect.name != "sqlite":
            return
        cols = conn.exec_driver_sql("PRAGMA table_info(video_call_requests)").fetchall()
        existing_names = {row[1] for row in cols}
        if "scheduled_for" not in existing_names:
            conn.exec_driver_sql("ALTER TABLE video_call_requests ADD COLUMN scheduled_for DATETIME")


_ensure_video_call_request_schema()

app = FastAPI(title="MediBridge — Offline-First Health Sync API")

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Root ──
@app.get("/")
def read_root():
    return {"message": "MediBridge Health Sync API is running."}

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"url": f"http://127.0.0.1:8000/uploads/{file.filename}"}
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")


# ══════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════

@app.post("/auth/worker/register", response_model=schemas.AuthResponse)
def register_worker(data: schemas.WorkerRegister, db: Session = Depends(get_db)):
    existing = db.query(models.Worker).filter(
        models.Worker.phone_number == data.phone_number
    ).first()
    if existing:
        raise HTTPException(400, "Phone number already registered")

    worker = models.Worker(
        full_name=data.full_name,
        phone_number=data.phone_number,
        pin_code=data.pin_code,
        village_or_region=data.village_or_region,
        primary_language=data.primary_language,
    )
    db.add(worker)
    db.commit()
    db.refresh(worker)

    return schemas.AuthResponse(
        id=worker.worker_id,
        role="worker",
        full_name=worker.full_name,
        token=f"worker_{worker.worker_id}",
    )


@app.post("/auth/worker/login", response_model=schemas.AuthResponse)
def login_worker(data: schemas.WorkerLogin, db: Session = Depends(get_db)):
    worker = db.query(models.Worker).filter(
        models.Worker.phone_number == data.phone_number
    ).first()
    if not worker or worker.pin_code != data.pin_code:
        raise HTTPException(401, "Invalid phone number or PIN")

    return schemas.AuthResponse(
        id=worker.worker_id,
        role="worker",
        full_name=worker.full_name,
        token=f"worker_{worker.worker_id}",
    )


@app.post("/auth/doctor/register", response_model=schemas.AuthResponse)
def register_doctor(data: schemas.DoctorRegister, db: Session = Depends(get_db)):
    existing = db.query(models.Doctor).filter(
        models.Doctor.email == data.email
    ).first()
    if existing:
        raise HTTPException(400, "Email already registered")

    doctor = models.Doctor(
        full_name=data.full_name,
        email=data.email,
        password=data.password,
        specialization=data.specialization,
        hospital_name=data.hospital_name,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return schemas.AuthResponse(
        id=doctor.doctor_id,
        role="doctor",
        full_name=doctor.full_name,
        token=f"doctor_{doctor.doctor_id}",
    )


@app.post("/auth/doctor/login", response_model=schemas.AuthResponse)
def login_doctor(data: schemas.DoctorLogin, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(
        models.Doctor.email == data.email
    ).first()
    if not doctor or doctor.password != data.password:
        raise HTTPException(401, "Invalid email or password")

    return schemas.AuthResponse(
        id=doctor.doctor_id,
        role="doctor",
        full_name=doctor.full_name,
        token=f"doctor_{doctor.doctor_id}",
    )


@app.post("/auth/user/register", response_model=schemas.AuthResponse)
def register_user(data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.aadhaar == data.aadhaar).first()
    if existing:
        raise HTTPException(400, "Aadhaar already registered")
    user = models.User(
        aadhaar=data.aadhaar,
        password=data.password,
        full_name=data.full_name,
        contact_number=data.contact_number,
    )
    db.add(user)
    # Ensure patient record exists for this aadhaar (for video call / history)
    patient = db.query(models.Patient).filter(models.Patient.patient_id == data.aadhaar).first()
    if not patient:
        db.add(models.Patient(
            patient_id=data.aadhaar,
            registered_by_worker_id=None,
            full_name=data.full_name,
            age=None,
            gender=None,
            contact_number=data.contact_number,
        ))
    db.commit()
    db.refresh(user)
    return schemas.AuthResponse(
        id=user.aadhaar,
        role="user",
        full_name=user.full_name,
        token=f"user_{user.aadhaar}",
    )


@app.post("/auth/user/login", response_model=schemas.AuthResponse)
def login_user(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.aadhaar == data.aadhaar).first()
    if not user or user.password != data.password:
        raise HTTPException(401, "Invalid Aadhaar or password")
    return schemas.AuthResponse(
        id=user.aadhaar,
        role="user",
        full_name=user.full_name,
        token=f"user_{user.aadhaar}",
    )


# ══════════════════════════════════════════
#  PATIENT ENDPOINTS
# ══════════════════════════════════════════

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.patient_id == patient_id
    ).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    return patient


@app.get("/patients/{patient_id}/consultations", response_model=List[schemas.ConsultationResponse])
def get_patient_consultations(patient_id: str, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    return (
        db.query(models.Consultation)
        .options(joinedload(models.Consultation.prescribed_medicines))
        .filter(models.Consultation.patient_id == patient_id)
        .order_by(models.Consultation.recorded_at.desc())
        .all()
    )


# ══════════════════════════════════════════
#  USER DETAIL (Aadhaar, name, basic details + history; no photo_path, audio, referral_required)
# ══════════════════════════════════════════

def _consultation_to_history_item(c: models.Consultation) -> schemas.ConsultationHistoryItem:
    return schemas.ConsultationHistoryItem(
        consultation_id=c.consultation_id,
        patient_id=c.patient_id,
        worker_id=c.worker_id or "",
        symptoms_text=c.symptoms_text,
        recorded_at=c.recorded_at,
        ai_triage_level=c.ai_triage_level or "GREEN",
        sync_status=c.sync_status or "PENDING",
        case_status=c.case_status or "OPEN",
        doctor_id=c.doctor_id,
        doctor_diagnosis=c.doctor_diagnosis,
        prescribed_medicines=[schemas.PrescribedMedicineResponse.model_validate(m) for m in (c.prescribed_medicines or [])],
    )


@app.get("/user-detail/{aadhaar}", response_model=schemas.UserDetailWithHistory)
def get_user_detail_with_history(aadhaar: str, db: Session = Depends(get_db)):
    """Return user (Aadhaar, name, basic details) and patient history. History excludes photo_paths, symptoms_audio_path, referral_required."""
    user = db.query(models.UserDetail).filter(models.UserDetail.aadhaar == aadhaar).first()
    patient = db.query(models.Patient).filter(models.Patient.patient_id == aadhaar).first()
    if not user and not patient:
        raise HTTPException(404, "User not found")
    if user:
        base = schemas.UserDetailWithHistory(
            aadhaar=user.aadhaar,
            full_name=user.full_name,
            age=user.age,
            gender=user.gender,
            contact_number=user.contact_number,
            created_at=user.created_at,
            updated_at=user.updated_at,
            history=[],
        )
    else:
        base = schemas.UserDetailWithHistory(
            aadhaar=patient.patient_id,
            full_name=patient.full_name,
            age=patient.age,
            gender=patient.gender,
            contact_number=patient.contact_number,
            created_at=patient.created_at,
            updated_at=None,
            history=[],
        )
    consultations = (
        db.query(models.Consultation)
        .options(joinedload(models.Consultation.prescribed_medicines))
        .filter(models.Consultation.patient_id == aadhaar)
        .order_by(models.Consultation.recorded_at.desc())
        .all()
    )
    base.history = [_consultation_to_history_item(c) for c in consultations]
    return base


@app.post("/user-detail", response_model=schemas.UserDetailResponse)
def create_or_update_user_detail(data: schemas.UserDetailCreate, db: Session = Depends(get_db)):
    """Create or update user detail (Aadhaar, name, basic details)."""
    existing = db.query(models.UserDetail).filter(models.UserDetail.aadhaar == data.aadhaar).first()
    if existing:
        existing.full_name = data.full_name
        existing.age = data.age
        existing.gender = data.gender
        existing.contact_number = data.contact_number
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    user = models.UserDetail(
        aadhaar=data.aadhaar,
        full_name=data.full_name,
        age=data.age,
        gender=data.gender,
        contact_number=data.contact_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/user/reminders/{aadhaar}", response_model=List[schemas.MedicineReminderItem])
def get_user_reminders(aadhaar: str, db: Session = Depends(get_db)):
    """Medicine reminders: prescribed medicines still within their course (recorded_at + duration_days >= today)."""
    consultations = (
        db.query(models.Consultation)
        .options(joinedload(models.Consultation.prescribed_medicines))
        .filter(models.Consultation.patient_id == aadhaar)
        .order_by(models.Consultation.recorded_at.desc())
        .all()
    )
    today = date.today()
    result = []
    for c in consultations:
        if not c.recorded_at:
            continue
        consult_date = c.recorded_at.date() if hasattr(c.recorded_at, "date") else c.recorded_at
        for pm in c.prescribed_medicines or []:
            end_date = consult_date + timedelta(days=pm.duration_days)
            if end_date >= today:
                result.append(schemas.MedicineReminderItem(
                    medicine_name=pm.medicine_name,
                    timing_frequency=pm.timing_frequency,
                    duration_days=pm.duration_days,
                    prescribed_at=c.recorded_at,
                    notes=pm.notes,
                ))
    return result


# ══════════════════════════════════════════
#  OFFLINE SYNC ENDPOINT
# ══════════════════════════════════════════

@app.post("/sync/offline-data")
def sync_offline_data(payload: schemas.OfflineSyncPayload, db: Session = Depends(get_db)):
    try:
        new_patients = 0
        new_consultations = 0

        for p in payload.patients:
            exists = db.query(models.Patient).filter(
                models.Patient.patient_id == p.patient_id
            ).first()
            if not exists:
                db.add(models.Patient(
                    patient_id=p.patient_id,
                    registered_by_worker_id=p.registered_by_worker_id,
                    full_name=p.full_name,
                    age=p.age,
                    gender=p.gender,
                    contact_number=p.contact_number,
                ))
                new_patients += 1

        for c in payload.consultations:
            exists = db.query(models.Consultation).filter(
                models.Consultation.consultation_id == c.consultation_id
            ).first()
            if not exists:
                ai_flag = _triage(c.symptoms_text)
                db.add(models.Consultation(
                    consultation_id=c.consultation_id,
                    patient_id=c.patient_id,
                    worker_id=c.worker_id,
                    symptoms_text=c.symptoms_text,
                    symptoms_audio_path=c.symptoms_audio_path,
                    photo_paths=c.photo_paths,
                    recorded_at=c.recorded_at or datetime.utcnow(),
                    ai_triage_level=ai_flag,
                    sync_status="SYNCED",
                    case_status="OPEN",
                ))
                new_consultations += 1

        db.commit()
        return {
            "status": "success",
            "synced": True,
            "new_patients": new_patients,
            "new_consultations": new_consultations,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(500, f"Sync failed: {str(exc)}")


# ══════════════════════════════════════════
#  DOCTOR ENDPOINTS
# ══════════════════════════════════════════

@app.get("/consultations/open", response_model=List[schemas.ConsultationResponse])
def get_open_consultations(db: Session = Depends(get_db)):
    consultations = (
        db.query(models.Consultation)
        .filter(models.Consultation.case_status == "OPEN")
        .all()
    )
    priority = {"RED": 1, "YELLOW": 2, "GREEN": 3}
    consultations.sort(key=lambda x: priority.get(x.ai_triage_level, 3))
    return consultations


@app.get("/consultations/all", response_model=List[schemas.ConsultationResponse])
def get_all_consultations(db: Session = Depends(get_db)):
    return db.query(models.Consultation).order_by(
        models.Consultation.recorded_at.desc()
    ).all()


@app.get("/consultations/{consultation_id}", response_model=schemas.ConsultationResponse)
def get_consultation(consultation_id: str, db: Session = Depends(get_db)):
    c = db.query(models.Consultation).filter(
        models.Consultation.consultation_id == consultation_id
    ).first()
    if not c:
        raise HTTPException(404, "Consultation not found")
    return c


@app.post("/consultations/{consultation_id}/prescribe")
def doctor_prescribe(
    consultation_id: str,
    payload: List[schemas.PrescribedMedicineCreate],
    doctor_id: str = "",
    db: Session = Depends(get_db),
):
    consultation = db.query(models.Consultation).filter(
        models.Consultation.consultation_id == consultation_id
    ).first()
    if not consultation:
        raise HTTPException(404, "Consultation not found")

    try:
        for med in payload:
            db.add(models.PrescribedMedicine(
                consultation_id=consultation_id,
                medicine_name=med.medicine_name,
                duration_days=med.duration_days,
                timing_frequency=med.timing_frequency,
                notes=med.notes,
            ))

        if doctor_id:
            consultation.doctor_id = doctor_id
        consultation.case_status = "COMPLETED"
        db.commit()
        return {"message": f"Prescribed {len(payload)} medicines. Case completed."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(500, f"Prescription failed: {str(exc)}")


# ══════════════════════════════════════════
#  DOCTOR: PATIENTS ATTENDED & ANALYTICS
# ══════════════════════════════════════════

@app.get("/doctors/{doctor_id}/consultations", response_model=List[schemas.ConsultationResponse])
def get_doctor_consultations(
    doctor_id: str,
    date_filter: str | None = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Consultation)
        .filter(
            models.Consultation.doctor_id == doctor_id,
            models.Consultation.case_status == "COMPLETED",
        )
    )
    if date_filter:
        try:
            d = datetime.strptime(date_filter, "%Y-%m-%d").date()
            start = datetime.combine(d, datetime.min.time())
            end = datetime.combine(d, datetime.max.time())
            q = q.filter(
                models.Consultation.recorded_at >= start,
                models.Consultation.recorded_at <= end,
            )
        except ValueError:
            pass
    return q.order_by(models.Consultation.recorded_at.desc()).all()


def _extract_symptom_keys(symptoms_text: str | None) -> List[str]:
    if not symptoms_text or not symptoms_text.strip():
        return []
    s = symptoms_text.lower().strip()
    words = re.findall(r"[a-z]+", s)
    stop = {"the", "and", "for", "with", "from", "patient", "has", "have", "had", "been", "this", "that"}
    return [w for w in words if len(w) > 2 and w not in stop][:5]


@app.get("/doctors/{doctor_id}/analytics")
def get_doctor_analytics(doctor_id: str, db: Session = Depends(get_db)):
    consultations = (
        db.query(models.Consultation)
        .filter(
            models.Consultation.doctor_id == doctor_id,
            models.Consultation.case_status == "COMPLETED",
        )
        .all()
    )
    triage_counts = {"RED": 0, "YELLOW": 0, "GREEN": 0}
    symptom_counts: dict = {}
    # area -> disease/symptom -> count (for disease-by-area heatmap)
    area_disease: dict = {}
    worker_ids = list({c.worker_id for c in consultations if c.worker_id})
    workers_by_id = {}
    if worker_ids:
        for w in db.query(models.Worker).filter(models.Worker.worker_id.in_(worker_ids)).all():
            workers_by_id[w.worker_id] = w

    for c in consultations:
        triage_counts[c.ai_triage_level or "GREEN"] = triage_counts.get(c.ai_triage_level or "GREEN", 0) + 1
        for key in _extract_symptom_keys(c.symptoms_text):
            symptom_counts[key] = symptom_counts.get(key, 0) + 1
        w = workers_by_id.get(c.worker_id)
        area = (w.village_or_region if w and w.village_or_region else "Unknown") or "Unknown"
        if area not in area_disease:
            area_disease[area] = {}
        for key in _extract_symptom_keys(c.symptoms_text):
            area_disease[area][key] = area_disease[area].get(key, 0) + 1

    symptom_list = [{"label": k, "count": v} for k, v in sorted(symptom_counts.items(), key=lambda x: -x[1])[:15]]

    # Build disease-by-area heatmap: areas (rows), diseases (columns), matrix
    areas_ordered = sorted(area_disease.keys())
    diseases_ordered = sorted(symptom_counts.keys(), key=lambda x: -symptom_counts[x])[:12]
    disease_by_area_matrix = []
    for ar in areas_ordered:
        row = [area_disease[ar].get(d, 0) for d in diseases_ordered]
        disease_by_area_matrix.append(row)

    days_back = 7
    heatmap_data = []
    for i in range(days_back):
        d = (date.today() - timedelta(days=days_back - 1 - i)).isoformat()
        start = datetime.strptime(d + " 00:00:00", "%Y-%m-%d %H:%M:%S")
        end = datetime.strptime(d + " 23:59:59", "%Y-%m-%d %H:%M:%S")
        day_cons = [c for c in consultations if c.recorded_at and start <= c.recorded_at <= end]
        by_triage = {"RED": 0, "YELLOW": 0, "GREEN": 0}
        for c in day_cons:
            by_triage[c.ai_triage_level or "GREEN"] = by_triage.get(c.ai_triage_level or "GREEN", 0) + 1
        heatmap_data.append({"date": d, "RED": by_triage["RED"], "YELLOW": by_triage["YELLOW"], "GREEN": by_triage["GREEN"]})

    return {
        "triage_counts": triage_counts,
        "symptom_counts": symptom_list,
        "heatmap": heatmap_data,
        "total_patients": len(consultations),
        "disease_by_area": {
            "areas": areas_ordered,
            "diseases": diseases_ordered,
            "matrix": disease_by_area_matrix,
        },
    }


# ══════════════════════════════════════════
#  VIDEO CALL REQUESTS
# ══════════════════════════════════════════

@app.post("/video-call-requests", response_model=schemas.VideoCallRequestResponse)
def create_video_call_request(data: schemas.VideoCallRequestCreate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == data.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    if data.requested_by_worker_id:
        worker = db.query(models.Worker).filter(models.Worker.worker_id == data.requested_by_worker_id).first()
        if not worker:
            raise HTTPException(404, "Worker not found")
    req = models.VideoCallRequest(
        patient_id=data.patient_id,
        requested_by_worker_id=data.requested_by_worker_id,
        notes=data.notes,
        scheduled_for=data.scheduled_for,
        status="PENDING",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@app.get("/video-call-requests/pending", response_model=List[schemas.VideoCallRequestEnriched])
def list_pending_video_call_requests(db: Session = Depends(get_db)):
    requests = (
        db.query(models.VideoCallRequest)
        .filter(models.VideoCallRequest.status == "PENDING")
        .order_by(models.VideoCallRequest.requested_at.desc())
        .all()
    )
    result = []
    for req in requests:
        patient = db.query(models.Patient).filter(models.Patient.patient_id == req.patient_id).first()
        worker = db.query(models.Worker).filter(models.Worker.worker_id == req.requested_by_worker_id).first()
        result.append(schemas.VideoCallRequestEnriched(
            request_id=req.request_id,
            patient_id=req.patient_id,
            requested_by_worker_id=req.requested_by_worker_id,
            status=req.status,
            notes=req.notes,
            requested_at=req.requested_at,
            scheduled_for=req.scheduled_for,
            patient_name=patient.full_name if patient else None,
            requested_by_name=worker.full_name if worker else None,
        ))
    return result


# Base URL for Sarvam TeleHealth (speech-recognition) app — used to build invite link for ASHA
TELEHEALTH_BASE_URL = os.getenv("TELEHEALTH_BASE_URL", "http://localhost:3000").rstrip("/")


def _build_patient_invite_link(request_id: str, worker_name: str) -> str:
    safe_request_id = quote(str(request_id or ""), safe="")
    safe_worker_name = quote((worker_name or "ASHA Worker"), safe="")
    # Include both userName and username for compatibility across telehealth builds.
    return (
        f"{TELEHEALTH_BASE_URL}/room/{safe_request_id}"
        f"?role=patient&userName={safe_worker_name}&username={safe_worker_name}"
    )


@app.get("/video-call-requests/worker/{worker_id}", response_model=List[schemas.VideoCallRequestEnriched])
def list_worker_video_call_requests(worker_id: str, db: Session = Depends(get_db)):
    requests = (
        db.query(models.VideoCallRequest)
        .filter(models.VideoCallRequest.requested_by_worker_id == worker_id)
        .order_by(models.VideoCallRequest.requested_at.desc())
        .all()
    )
    worker = db.query(models.Worker).filter(models.Worker.worker_id == worker_id).first()
    worker_name = (worker.full_name if worker else None) or "ASHA Worker"
    result = []
    for req in requests:
        patient = db.query(models.Patient).filter(models.Patient.patient_id == req.patient_id).first()
        invite_link = None
        if (req.status or "").upper() == "ACCEPTED":
            invite_link = _build_patient_invite_link(req.request_id, worker_name)
        result.append(schemas.VideoCallRequestEnriched(
            request_id=req.request_id,
            patient_id=req.patient_id,
            requested_by_worker_id=req.requested_by_worker_id,
            status=req.status,
            notes=req.notes,
            requested_at=req.requested_at,
            scheduled_for=req.scheduled_for,
            patient_name=patient.full_name if patient else None,
            requested_by_name=worker_name,
            invite_link=invite_link,
        ))
    return result


@app.get("/video-call-requests/patient/{patient_id}", response_model=List[schemas.VideoCallRequestEnriched])
def list_patient_video_call_requests(patient_id: str, db: Session = Depends(get_db)):
    requests = (
        db.query(models.VideoCallRequest)
        .filter(models.VideoCallRequest.patient_id == patient_id)
        .order_by(models.VideoCallRequest.requested_at.desc())
        .all()
    )
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    patient_name = (patient.full_name if patient else None) or "Patient"
    result = []
    for req in requests:
        worker = db.query(models.Worker).filter(models.Worker.worker_id == req.requested_by_worker_id).first()
        invite_link = None
        if (req.status or "").upper() == "ACCEPTED":
            invite_link = _build_patient_invite_link(req.request_id, patient_name)
        result.append(schemas.VideoCallRequestEnriched(
            request_id=req.request_id,
            patient_id=req.patient_id,
            requested_by_worker_id=req.requested_by_worker_id,
            status=req.status,
            notes=req.notes,
            requested_at=req.requested_at,
            scheduled_for=req.scheduled_for,
            patient_name=patient_name,
            requested_by_name=worker.full_name if worker else "Self",
            invite_link=invite_link,
        ))
    return result


@app.patch("/video-call-requests/{request_id}")
def update_video_call_request(
    request_id: str,
    data: schemas.VideoCallRequestUpdate,
    db: Session = Depends(get_db),
):
    req = db.query(models.VideoCallRequest).filter(
        models.VideoCallRequest.request_id == request_id
    ).first()
    if not req:
        raise HTTPException(404, "Video call request not found")
    if req.status != "PENDING":
        raise HTTPException(400, "Request already responded")
    req.status = data.status
    req.responded_at = datetime.utcnow()
    if data.doctor_id:
        req.doctor_id = data.doctor_id
    db.commit()
    out = {"message": f"Request {data.status.lower()}."}
    if (data.status or "").upper() == "ACCEPTED":
        if req.requested_by_worker_id:
            worker = db.query(models.Worker).filter(models.Worker.worker_id == req.requested_by_worker_id).first()
            receiver_name = (worker.full_name if worker else None) or "ASHA Worker"
        else:
            patient = db.query(models.Patient).filter(models.Patient.patient_id == req.patient_id).first()
            receiver_name = (patient.full_name if patient else None) or "Patient"
        out["invite_link"] = _build_patient_invite_link(req.request_id, receiver_name)
    return out


# ── Helpers ──

def _triage(symptoms_text: str | None) -> str:
    if not symptoms_text:
        return "GREEN"
    s = symptoms_text.lower()
    red_keywords = ["chest pain", "unconscious", "breathing difficulty", "seizure", "bleeding heavily", "not breathing"]
    yellow_keywords = ["fever", "vomit", "diarrhea", "rash", "cough", "headache", "pain"]
    if any(k in s for k in red_keywords):
        return "RED"
    if any(k in s for k in yellow_keywords):
        return "YELLOW"
    return "GREEN"
