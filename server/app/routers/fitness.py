from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session, joinedload
from datetime import date as date_type

from ..database import get_db
from ..crud import fitness as crud
from ..models.fitness import WorkoutEntry, WorkoutTemplate
from ..schemas.fitness import (
    WorkoutEntryCreate, WorkoutEntryUpdate, WorkoutEntryOut,
    WorkoutTemplateCreate, WorkoutTemplateUpdate, WorkoutTemplateOut,
)

router = APIRouter(tags=["fitness"])


# ── Workouts ──────────────────────────────────────────────────────────────────

@router.get("/workouts", response_model=list[WorkoutEntryOut])
def list_workouts(start: date_type = Query(...), end: date_type = Query(...), db: Session = Depends(get_db)):
    return crud.get_workouts_in_range(db, start, end)


@router.get("/workouts/date/{d}", response_model=WorkoutEntryOut)
def get_by_date(d: date_type, db: Session = Depends(get_db)):
    entry = crud.get_workout_by_date(db, d)
    if not entry:
        raise HTTPException(status_code=404, detail="No workout for this date")
    return entry


@router.get("/workouts/{entry_id}", response_model=WorkoutEntryOut)
def get_workout(entry_id: int, db: Session = Depends(get_db)):
    entry = crud.get_workout(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Workout not found")
    return entry


@router.post("/workouts", response_model=WorkoutEntryOut, status_code=201)
def create_workout(data: WorkoutEntryCreate, db: Session = Depends(get_db)):
    return crud.create_workout(db, data)


@router.put("/workouts/{entry_id}", response_model=WorkoutEntryOut)
def update_workout(entry_id: int, data: WorkoutEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(WorkoutEntry).filter(WorkoutEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Workout not found")
    return crud.update_workout(db, entry, data)


@router.delete("/workouts/{entry_id}", status_code=204)
def delete_workout(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(WorkoutEntry).filter(WorkoutEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Workout not found")
    crud.delete_workout(db, entry)
    return Response(status_code=204)


# ── Templates ─────────────────────────────────────────────────────────────────

@router.get("/templates", response_model=list[WorkoutTemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return crud.get_templates(db)


@router.get("/templates/{tid}", response_model=WorkoutTemplateOut)
def get_template(tid: int, db: Session = Depends(get_db)):
    t = crud.get_template(db, tid)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.post("/templates", response_model=WorkoutTemplateOut, status_code=201)
def create_template(data: WorkoutTemplateCreate, db: Session = Depends(get_db)):
    return crud.create_template(db, data)


@router.put("/templates/{tid}", response_model=WorkoutTemplateOut)
def update_template(tid: int, data: WorkoutTemplateUpdate, db: Session = Depends(get_db)):
    t = db.query(WorkoutTemplate).options(joinedload(WorkoutTemplate.exercises)).filter(WorkoutTemplate.id == tid).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return crud.update_template(db, t, data)


@router.delete("/templates/{tid}", status_code=204)
def delete_template(tid: int, db: Session = Depends(get_db)):
    t = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == tid).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    crud.delete_template(db, t)
    return Response(status_code=204)
