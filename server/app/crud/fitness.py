from datetime import date as date_type
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from ..models.fitness import WorkoutEntry, WorkoutExercise, WorkoutRun, WorkoutTemplate, WorkoutTemplateExercise
from ..schemas.fitness import WorkoutEntryCreate, WorkoutEntryUpdate, WorkoutTemplateCreate, WorkoutTemplateUpdate


def _load_entry(db: Session, entry_id: int) -> Optional[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.id == entry_id).first())


def get_workouts_in_range(db: Session, start: date_type, end: date_type) -> list[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.date >= start, WorkoutEntry.date <= end)
            .order_by(WorkoutEntry.date).all())


def get_workout_by_date(db: Session, d: date_type) -> Optional[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.date == d).first())


def get_workout(db: Session, entry_id: int) -> Optional[WorkoutEntry]:
    return _load_entry(db, entry_id)


def create_workout(db: Session, data: WorkoutEntryCreate) -> WorkoutEntry:
    entry = WorkoutEntry(
        date=data.date, workout_type=data.workout_type,
        custom_type_label=data.custom_type_label, title=data.title,
        status=data.status, notes=data.notes,
    )
    db.add(entry)
    db.flush()
    for i, ex in enumerate(data.exercises):
        db.add(WorkoutExercise(workout_entry_id=entry.id, exercise_name=ex.exercise_name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    if data.run:
        db.add(WorkoutRun(workout_entry_id=entry.id, distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes, notes=data.run.notes))
    db.commit()
    return _load_entry(db, entry.id)


def update_workout(db: Session, entry: WorkoutEntry, data: WorkoutEntryUpdate) -> WorkoutEntry:
    if data.date is not None: entry.date = data.date
    if data.workout_type is not None: entry.workout_type = data.workout_type
    entry.custom_type_label = data.custom_type_label
    entry.title = data.title
    if data.status is not None: entry.status = data.status
    entry.notes = data.notes
    if data.exercises is not None:
        db.query(WorkoutExercise).filter(WorkoutExercise.workout_entry_id == entry.id).delete()
        for i, ex in enumerate(data.exercises):
            db.add(WorkoutExercise(workout_entry_id=entry.id, exercise_name=ex.exercise_name,
                sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    # Always sync run: delete existing, re-add if new data provided
    db.query(WorkoutRun).filter(WorkoutRun.workout_entry_id == entry.id).delete()
    if data.run is not None:
        db.add(WorkoutRun(workout_entry_id=entry.id, distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes, notes=data.run.notes))
    db.commit()
    return _load_entry(db, entry.id)


def delete_workout(db: Session, entry: WorkoutEntry) -> None:
    db.delete(entry); db.commit()


# ── Templates ─────────────────────────────────────────────────────────────────

def _load_template(db: Session, tid: int) -> Optional[WorkoutTemplate]:
    return (db.query(WorkoutTemplate)
            .options(joinedload(WorkoutTemplate.exercises))
            .filter(WorkoutTemplate.id == tid).first())


def get_templates(db: Session) -> list[WorkoutTemplate]:
    return (db.query(WorkoutTemplate)
            .options(joinedload(WorkoutTemplate.exercises))
            .order_by(WorkoutTemplate.name).all())


def get_template(db: Session, tid: int) -> Optional[WorkoutTemplate]:
    return _load_template(db, tid)


def create_template(db: Session, data: WorkoutTemplateCreate) -> WorkoutTemplate:
    t = WorkoutTemplate(name=data.name, workout_type=data.workout_type,
        custom_type_label=data.custom_type_label, notes=data.notes)
    db.add(t); db.flush()
    for i, ex in enumerate(data.exercises):
        db.add(WorkoutTemplateExercise(template_id=t.id, exercise_name=ex.exercise_name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    db.commit()
    return _load_template(db, t.id)


def update_template(db: Session, t: WorkoutTemplate, data: WorkoutTemplateUpdate) -> WorkoutTemplate:
    if data.name is not None: t.name = data.name
    if data.workout_type is not None: t.workout_type = data.workout_type
    if data.custom_type_label is not None: t.custom_type_label = data.custom_type_label
    if data.notes is not None: t.notes = data.notes
    if data.exercises is not None:
        db.query(WorkoutTemplateExercise).filter(WorkoutTemplateExercise.template_id == t.id).delete()
        for i, ex in enumerate(data.exercises):
            db.add(WorkoutTemplateExercise(template_id=t.id, exercise_name=ex.exercise_name,
                sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    db.commit()
    return _load_template(db, t.id)


def delete_template(db: Session, t: WorkoutTemplate) -> None:
    db.delete(t); db.commit()
