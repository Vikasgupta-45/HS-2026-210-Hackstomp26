from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediBridge — Offline-First Health Sync API")

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
    return (
        db.query(models.Consultation)
        .filter(models.Consultation.patient_id == patient_id)
        .order_by(models.Consultation.recorded_at.desc())
        .all()
    )


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
