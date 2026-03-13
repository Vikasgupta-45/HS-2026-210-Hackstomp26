import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Worker(Base):
    __tablename__ = "workers"
    
    worker_id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    pin_code = Column(String)  # Simple 4-digit PIN hash
    village_or_region = Column(String)
    primary_language = Column(String)

    # relations
    patients = relationship("Patient", back_populates="worker")
    consultations = relationship("Consultation", back_populates="worker")

class Doctor(Base):
    __tablename__ = "doctors"
    
    doctor_id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    specialization = Column(String)
    hospital_name = Column(String)

    consultations = relationship("Consultation", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"
    
    # Using Aadhaar number as Patient ID per user request
    patient_id = Column(String, primary_key=True, index=True)
    registered_by_worker_id = Column(String, ForeignKey("workers.worker_id"))
    full_name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    contact_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    worker = relationship("Worker", back_populates="patients")
    consultations = relationship("Consultation", back_populates="patient")

class Consultation(Base):
    __tablename__ = "consultations"
    
    consultation_id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.patient_id"))
    worker_id = Column(String, ForeignKey("workers.worker_id"))
    doctor_id = Column(String, ForeignKey("doctors.doctor_id"), nullable=True)
    
    # Offline Data from Worker
    symptoms_text = Column(String, nullable=True)
    symptoms_audio_path = Column(String, nullable=True)
    photo_paths = Column(String, nullable=True) # Stored as comma-separated links or JSON string
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # AI System Generated
    ai_triage_level = Column(String, default="GREEN") # RED, YELLOW, GREEN
    ai_transcript_text = Column(String, nullable=True)
    summary_pdf_url = Column(String, nullable=True)
    
    # Sync Status
    sync_status = Column(String, default="PENDING") # PENDING, UPLOADING, SYNCED
    
    # Online Data from Doctor
    doctor_diagnosis = Column(String, nullable=True)
    doctor_audio_path = Column(String, nullable=True)
    referral_required = Column(Boolean, default=False)
    case_status = Column(String, default="OPEN") # OPEN, IN_REVIEW, COMPLETED

    # relations
    patient = relationship("Patient", back_populates="consultations")
    worker = relationship("Worker", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
    prescribed_medicines = relationship("PrescribedMedicine", back_populates="consultation")

class PrescribedMedicine(Base):
    __tablename__ = "prescribed_medicines"
    
    prescription_id = Column(String, primary_key=True, default=generate_uuid)
    consultation_id = Column(String, ForeignKey("consultations.consultation_id"))
    
    medicine_name = Column(String)
    duration_days = Column(Integer)
    timing_frequency = Column(String)
    notes = Column(String, nullable=True)

    consultation = relationship("Consultation", back_populates="prescribed_medicines")