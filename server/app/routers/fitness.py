from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.fitness import WorkoutLog
from ..schemas.fitness import (
    PlanConfigOut,
    PlanConfigCreate,
    WorkoutLogOut,
    WorkoutLogCreate,
)
from ..crud import fitness as crud
from ..services.fitness_plan import PLAN

router = APIRouter(tags=["fitness"])


# ── Config ──────────────────────────────────────────────────────────────────

@router.get("/config", response_model=PlanConfigOut)
def get_config(db: Session = Depends(get_db)):
    config = crud.get_config(db)
    if not config:
        raise HTTPException(status_code=404, detail="No plan config set")
    return config


@router.post("/config", response_model=PlanConfigOut)
def set_config(body: PlanConfigCreate, db: Session = Depends(get_db)):
    return crud.set_config(db, body.start_date)


# ── Plan ─────────────────────────────────────────────────────────────────────

@router.get("/plan")
def get_plan():
    return PLAN


@router.get("/plan/{day_index}")
def get_plan_day(day_index: int):
    if day_index < 0 or day_index >= len(PLAN):
        raise HTTPException(status_code=404, detail="Plan day not found")
    return PLAN[day_index]


# ── Logs ──────────────────────────────────────────────────────────────────────

@router.get("/logs", response_model=list[WorkoutLogOut])
def get_logs(db: Session = Depends(get_db)):
    return crud.get_logs(db)


@router.get("/logs/day/{day_index}", response_model=WorkoutLogOut)
def get_log_by_day(day_index: int, db: Session = Depends(get_db)):
    log = crud.get_log_by_day(db, day_index)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.post("/logs", response_model=WorkoutLogOut, status_code=201)
def create_log(body: WorkoutLogCreate, db: Session = Depends(get_db)):
    return crud.create_log(db, body)


@router.put("/logs/{log_id}", response_model=WorkoutLogOut)
def update_log(log_id: int, body: WorkoutLogCreate, db: Session = Depends(get_db)):
    log = db.query(WorkoutLog).filter(WorkoutLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return crud.update_log(db, log, body)


@router.delete("/logs/{log_id}", status_code=204)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(WorkoutLog).filter(WorkoutLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    crud.delete_log(db, log)
    return Response(status_code=204)
