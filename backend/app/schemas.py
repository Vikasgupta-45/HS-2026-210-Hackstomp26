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


class UserRegister(BaseModel):
    aadhaar: constr(min_length=12, max_length=12)
    password: str
    full_name: str
    contact_number: Optional[str] = None


class UserLogin(BaseModel):
    aadhaar: constr(min_length=12, max_length=12)
    password: str


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


# ── User detail + history (no photo_paths, symptoms_audio_path, referral_required) ──
class ConsultationHistoryItem(BaseModel):
    """Consultation history entry: excludes photo_paths, symptoms_audio_path, referral_required."""
    consultation_id: str
    patient_id: str
    worker_id: str
    symptoms_text: Optional[str] = None
    recorded_at: Optional[datetime] = None
    ai_triage_level: str
    sync_status: str
    case_status: str
    doctor_id: Optional[str] = None
    doctor_diagnosis: Optional[str] = None
    prescribed_medicines: List[PrescribedMedicineResponse] = []

    class Config:
        from_attributes = True


class UserDetailCreate(BaseModel):
    aadhaar: constr(min_length=12, max_length=12)
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None


class UserDetailResponse(BaseModel):
    aadhaar: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserDetailWithHistory(BaseModel):
    """User detail with patient history; history items omit photo_path, audio, referral_required."""
    aadhaar: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_number: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    history: List[ConsultationHistoryItem] = []


# ── Video Call Request ──
class VideoCallRequestCreate(BaseModel):
    patient_id: str
    requested_by_worker_id: Optional[str] = None  # None when user self-books
    notes: Optional[str] = None
    scheduled_for: Optional[datetime] = None

class VideoCallRequestResponse(BaseModel):
    request_id: str
    patient_id: str
    requested_by_worker_id: Optional[str] = None
    status: str
    notes: Optional[str] = None
    requested_at: datetime
    scheduled_for: Optional[datetime] = None

    class Config:
        from_attributes = True

class VideoCallRequestEnriched(VideoCallRequestResponse):
    patient_name: Optional[str] = None
    requested_by_name: Optional[str] = None
    invite_link: Optional[str] = None  # Patient join URL (sent to Arogya Sethu when doctor accepts)

class VideoCallRequestUpdate(BaseModel):
    status: str  # ACCEPTED, REJECTED
    doctor_id: Optional[str] = None


class MedicineReminderItem(BaseModel):
    medicine_name: str
    timing_frequency: str
    duration_days: int
    prescribed_at: Optional[datetime] = None
    notes: Optional[str] = None


# ── Offline Sync Payload ──
class OfflineSyncPayload(BaseModel):
    worker_id: str
    patients: List[PatientCreate] = []
    consultations: List[ConsultationCreate] = []
