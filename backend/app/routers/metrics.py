from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"]
)

@router.get("/", response_model=schemas.MetricsResponse)
def get_global_metrics(db: Session = Depends(get_db)):
    return crud.get_global_metrics(db)
