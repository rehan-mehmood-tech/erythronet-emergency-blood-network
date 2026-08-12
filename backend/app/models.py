import time
from sqlalchemy import Column, String, Integer, Float
from .database import Base

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(String, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    hospital = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    city = Column(String, nullable=False)
    district = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    units = Column(Integer, nullable=False)
    medical_context = Column(String, nullable=True)
    urgency = Column(String, nullable=False)  # critical, urgent, routine
    status = Column(String, default="awaiting", nullable=False)  # awaiting, en-route, fulfilled
    phone = Column(String, nullable=False)
    slip_url = Column(String, nullable=True)
    created_at = Column(Float, default=time.time, nullable=False)
    
    # Handshake lock fields
    donor_name = Column(String, nullable=True)
    donor_eta = Column(String, nullable=True)
    accepted_by_donor_id = Column(String, nullable=True)
    accepted_at = Column(Float, nullable=True)
    lock_expires_at = Column(Float, nullable=True)

class Donor(Base):
    __tablename__ = "donors"

    uid = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    district = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    notifications = Column(String, nullable=False)  # JSON-serialized list of preferences
    last_donation = Column(String, nullable=True)
    total_donations = Column(Integer, default=0, nullable=False)
    registered_at = Column(Float, default=time.time, nullable=False)
