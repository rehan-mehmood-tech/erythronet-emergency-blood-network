from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter(
    prefix="/donors",
    tags=["donors"]
)

@router.post("/", response_model=schemas.DonorResponse, status_code=status.HTTP_201_CREATED)
def register_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = crud.get_donor_by_phone(db, donor.phone)
    if db_donor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A donor with this mobile number is already registered"
        )
    new_donor = crud.create_donor(db, donor)
    # Return formatted schema payload
    return crud.format_donor_response(new_donor)

@router.get("/{uid}", response_model=schemas.DonorResponse)
def get_donor_profile(uid: str, db: Session = Depends(get_db)):
    db_donor = crud.get_donor(db, uid)
    if not db_donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor profile not found"
        )
    return crud.format_donor_response(db_donor)

@router.post("/login", response_model=schemas.DonorResponse)
def login_donor(login_data: schemas.DonorLogin, db: Session = Depends(get_db)):
    db_donor = crud.get_donor_by_phone(db, login_data.phone)
    if not db_donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No voluntary donor registered under this phone number"
        )
    return crud.format_donor_response(db_donor)
