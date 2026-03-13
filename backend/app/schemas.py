from pydantic import BaseModel, constr
from typing import List, Optional
from datetime import datetime


# ── Auth ──
class WorkerRegister(BaseModel):
    full_name: str
    phone_number: str
    pin_code: str
    village_or_region: str
    primary_language: str = "hindi"

class WorkerLogin(BaseModel):
    phone_number: str
    pin_code: str

class DoctorRegister(BaseModel):
    full_name: str
    email: str
    password: str
    specialization: str
    hospital_name: str

class DoctorLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    id: str
    role: str
    full_name: str
    token: str


# ── Prescribed Medicine ──
class PrescribedMedicineCreate(BaseModel):
    medicine_name: str
    duration_days: int
    timing_frequency: str
    notes: Optional[str] = None

class PrescribedMedicineResponse(PrescribedMedicineCreate):
    prescription_id: str
    consultation_id: str

    class Config:
        from_attributes = True


# ── Patient ──
class PatientCreate(BaseModel):
    patient_id: constr(min_length=12, max_length=12)
    registered_by_worker_id: str
    full_name: str
    age: int
    gender: str
    contact_number: Optional[str] = None

class PatientResponse(PatientCreate):
    created_at: datetime

    class Config:
        from_attributes = True


# ── Consultation ──
class ConsultationCreate(BaseModel):
    consultation_id: str
    patient_id: str
    worker_id: str
    symptoms_text: Optional[str] = None
    symptoms_audio_path: Optional[str] = None
    photo_paths: Optional[str] = None
    recorded_at: Optional[datetime] = None

class ConsultationResponse(ConsultationCreate):
    ai_triage_level: str
    sync_status: str
    case_status: str
    doctor_id: Optional[str] = None
    doctor_diagnosis: Optional[str] = None
    referral_required: bool
    prescribed_medicines: List[PrescribedMedicineResponse] = []

    class Config:
        from_attributes = True


# ── Offline Sync Payload ──
class OfflineSyncPayload(BaseModel):
    worker_id: str
    patients: List[PatientCreate] = []
    consultations: List[ConsultationCreate] = []
