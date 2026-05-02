from datetime import date
from typing import Optional
from sqlalchemy.orm import Session, joinedload

from ..models.fitness import FitnessPlanConfig, WorkoutLog, ExerciseSet, RunEntry
from ..schemas.fitness import WorkoutLogCreate


def get_config(db: Session) -> Optional[FitnessPlanConfig]:
    return db.query(FitnessPlanConfig).first()


def set_config(db: Session, start_date: date) -> FitnessPlanConfig:
    existing = db.query(FitnessPlanConfig).first()
    if existing:
        db.delete(existing)
        db.flush()
    config = FitnessPlanConfig(start_date=start_date)
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


def get_logs(db: Session) -> list[WorkoutLog]:
    return (
        db.query(WorkoutLog)
        .options(joinedload(WorkoutLog.exercises), joinedload(WorkoutLog.run))
        .order_by(WorkoutLog.logged_date.desc())
        .all()
    )


def get_log_by_day(db: Session, day_index: int) -> Optional[WorkoutLog]:
    return (
        db.query(WorkoutLog)
        .options(joinedload(WorkoutLog.exercises), joinedload(WorkoutLog.run))
        .filter(WorkoutLog.plan_day_index == day_index)
        .first()
    )


def create_log(db: Session, data: WorkoutLogCreate) -> WorkoutLog:
    log = WorkoutLog(
        plan_day_index=data.plan_day_index,
        logged_date=data.logged_date,
        notes=data.notes,
    )
    db.add(log)
    db.flush()

    for ex in data.exercises:
        exercise = ExerciseSet(
            workout_log_id=log.id,
            exercise_name=ex.exercise_name,
            sets=ex.sets,
            reps=ex.reps,
            weight=ex.weight,
            notes=ex.notes,
            sort_order=ex.sort_order,
        )
        db.add(exercise)

    if data.run is not None:
        run = RunEntry(
            workout_log_id=log.id,
            distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes,
            notes=data.run.notes,
        )
        db.add(run)

    db.commit()
    db.refresh(log)
    return (
        db.query(WorkoutLog)
        .options(joinedload(WorkoutLog.exercises), joinedload(WorkoutLog.run))
        .filter(WorkoutLog.id == log.id)
        .first()
    )


def update_log(db: Session, log: WorkoutLog, data: WorkoutLogCreate) -> WorkoutLog:
    # Delete existing child rows
    db.query(ExerciseSet).filter(ExerciseSet.workout_log_id == log.id).delete()
    db.query(RunEntry).filter(RunEntry.workout_log_id == log.id).delete()
    db.flush()

    # Update log fields
    log.plan_day_index = data.plan_day_index
    log.logged_date = data.logged_date
    log.notes = data.notes

    for ex in data.exercises:
        exercise = ExerciseSet(
            workout_log_id=log.id,
            exercise_name=ex.exercise_name,
            sets=ex.sets,
            reps=ex.reps,
            weight=ex.weight,
            notes=ex.notes,
            sort_order=ex.sort_order,
        )
        db.add(exercise)

    if data.run is not None:
        run = RunEntry(
            workout_log_id=log.id,
            distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes,
            notes=data.run.notes,
        )
        db.add(run)

    db.commit()
    return (
        db.query(WorkoutLog)
        .options(joinedload(WorkoutLog.exercises), joinedload(WorkoutLog.run))
        .filter(WorkoutLog.id == log.id)
        .first()
    )


def delete_log(db: Session, log: WorkoutLog) -> None:
    db.delete(log)
    db.commit()
