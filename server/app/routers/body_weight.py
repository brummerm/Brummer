from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.body_weight import BodyWeightCreate, BodyWeightUpdate, BodyWeightResponse
from ..crud import body_weight as crud

router = APIRouter(prefix="/body-weight", tags=["body-weight"])

@router.get("", response_model=list[BodyWeightResponse])
def list_weights(db: Session = Depends(get_db)):
    return crud.list_body_weights(db)

@router.post("", response_model=BodyWeightResponse)
def log_weight(data: BodyWeightCreate, db: Session = Depends(get_db)):
    existing = crud.get_by_date(db, data.date)
    if existing:
        return crud.update_body_weight(db, existing, BodyWeightUpdate(weight_lbs=data.weight_lbs, notes=data.notes))
    return crud.create_body_weight(db, data)

@router.put("/{bw_id}", response_model=BodyWeightResponse)
def update_weight(bw_id: int, data: BodyWeightUpdate, db: Session = Depends(get_db)):
    bw = crud.get_body_weight(db, bw_id)
    if not bw:
        raise HTTPException(status_code=404, detail="Entry not found")
    return crud.update_body_weight(db, bw, data)

@router.delete("/{bw_id}", status_code=204)
def delete_weight(bw_id: int, db: Session = Depends(get_db)):
    bw = crud.get_body_weight(db, bw_id)
    if not bw:
        raise HTTPException(status_code=404, detail="Entry not found")
    crud.delete_body_weight(db, bw)
