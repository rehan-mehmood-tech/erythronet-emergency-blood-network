from pydantic import BaseModel, Field
from typing import List, Optional

# Blood Request Schemas
class BloodRequestBase(BaseModel):
    patient_name: str
    hospital: str
    ward: str
    city: str
    district: str
    blood_group: str
    units: int
    medical_context: Optional[str] = "General Emergency"
    urgency: str
    phone: str

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequestAccept(BaseModel):
    donor_name: str
    donor_eta: str
    donor_id: str

class BloodRequestResponse(BloodRequestBase):
    id: str
    status: str
    slip_url: Optional[str] = None
    created_at: float
    donor_name: Optional[str] = None
    donor_eta: Optional[str] = None
    accepted_by_donor_id: Optional[str] = None
    accepted_at: Optional[float] = None
    lock_expires_at: Optional[float] = None

    class Config:
        from_attributes = True

# Donor Schemas
class DonorBase(BaseModel):
    name: str
    phone: str
    city: str
    district: str
    blood_group: str
    notifications: List[str]
    last_donation: Optional[str] = None

class DonorCreate(BaseModel):
    uid: str
    name: str
    phone: str
    city: str
    district: str
    blood_group: str
    notifications: List[str]
    last_donation: Optional[str] = None

class DonorLogin(BaseModel):
    phone: str

class DonorResponse(BaseModel):
    uid: str
    name: str
    phone: str
    city: str
    district: str
    blood_group: str
    notifications: List[str]
    last_donation: Optional[str] = None
    total_donations: int
    registered_at: float

    class Config:
        from_attributes = True

# Metrics Schema
class MetricsResponse(BaseModel):
    total_fulfilled: int
    total_donors: int
    avg_response_minutes: int
