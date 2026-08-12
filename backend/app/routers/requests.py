import uuid
import os
import shutil
import time
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas
from ..config import settings

router = APIRouter(
    prefix="/requests",
    tags=["requests"]
)

@router.post("/", response_model=schemas.BloodRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    patient_name: str = Form(...),
    hospital: str = Form(...),
    ward: str = Form(...),
    city: str = Form(...),
    district: str = Form(...),
    blood_group: str = Form(...),
    units: int = Form(...),
    urgency: str = Form(...),
    phone: str = Form(...),
    medical_context: Optional[str] = Form("General Emergency"),
    slip_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Generate unique request id
    req_id = "req-" + str(uuid.uuid4())[:8]
    slip_url = None

    # Handle file upload if present
    if slip_file:
        try:
            # Ensure upload directory exists
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            
            # Save file with unique filename to prevent overwrites
            file_extension = os.path.splitext(slip_file.filename)[1]
            unique_filename = f"{req_id}{file_extension}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(slip_file.file, buffer)
                
            # Create public asset URL
            slip_url = f"{settings.BASE_URL}/uploads/{unique_filename}"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload hospital slip: {str(e)}"
            )
    else:
        # Placeholder image URL if none uploaded
        slip_url = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"

    request_create = schemas.BloodRequestCreate(
        patient_name=patient_name,
        hospital=hospital,
        ward=ward,
        city=city,
        district=district,
        blood_group=blood_group,
        units=units,
        medical_context=medical_context,
        urgency=urgency,
        phone=phone
    )

    db_request = crud.create_blood_request(db, request_create, req_id, slip_url)
    
    # Broadcast simulation output to logs
    print(f"[BROADCAST] FastAPI Broadcast Engine triggered for Request {req_id}:")
    print(f"- Channel A (Live Board): Published to database.")
    print(f"- Channel B (SMS/WhatsApp): Dispatched match notifications to matching {blood_group} donors in {city} ({district}).")

    return db_request

@router.get("/", response_model=List[schemas.BloodRequestResponse])
def read_requests(
    city: Optional[str] = None,
    blood_group: Optional[str] = None,
    urgency: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    requests = crud.get_requests(
        db, skip=skip, limit=limit, 
        city=city, blood_group=blood_group, 
        urgency=urgency, status=status
    )
    return requests

@router.get("/{id}", response_model=schemas.BloodRequestResponse)
def read_request(id: str, db: Session = Depends(get_db)):
    db_request = crud.get_request(db, id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood request not found"
        )
    return db_request

@router.post("/{id}/accept", response_model=schemas.BloodRequestResponse)
def accept_request(
    id: str, 
    accept_data: schemas.BloodRequestAccept, 
    db: Session = Depends(get_db)
):
    db_request = crud.get_request(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
    
    if db_request.status != "awaiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Request is already accepted or fulfilled"
        )
        
    updated_request = crud.accept_blood_request(db, id, accept_data)
    return updated_request

@router.post("/{id}/cancel", response_model=schemas.BloodRequestResponse)
def cancel_request(id: str, db: Session = Depends(get_db)):
    db_request = crud.get_request(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
        
    if db_request.status != "en-route":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Request is not locked by a donor en-route"
        )
        
    updated_request = crud.cancel_blood_request(db, id)
    return updated_request

@router.post("/{id}/fulfill", response_model=schemas.BloodRequestResponse)
def fulfill_request(id: str, db: Session = Depends(get_db)):
    db_request = crud.get_request(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
        
    if db_request.status != "en-route":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Request must be en-route before fulfillment"
        )
        
    updated_request = crud.fulfill_blood_request(db, id)
    return updated_request
