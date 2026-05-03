from __future__ import annotations
import json
from sqlalchemy.orm import Session, joinedload

from ..models.grades import Rubric, RubricCriterion, GradeEntry
from ..schemas.grades import (
    RubricCreate, RubricUpdate,
    RubricCriterionCreate, RubricCriterionUpdate,
    GradeEntryCreate,
)


def _letter_grade(pct: float) -> str:
    if pct >= 90:
        return "A"
    if pct >= 80:
        return "B"
    if pct >= 70:
        return "C"
    if pct >= 60:
        return "D"
    return "F"


# ── Rubrics ───────────────────────────────────────────────────────────────────

def get_rubrics(db: Session) -> list[Rubric]:
    return db.query(Rubric).order_by(Rubric.created_at.desc()).all()


def get_rubric(db: Session, rubric_id: int) -> Rubric | None:
    return db.query(Rubric).filter(Rubric.id == rubric_id).first()


def create_rubric(db: Session, data: RubricCreate) -> Rubric:
    rubric = Rubric(**data.model_dump())
    db.add(rubric)
    db.commit()
    db.refresh(rubric)
    return rubric


def update_rubric(db: Session, rubric: Rubric, data: RubricUpdate) -> Rubric:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rubric, field, value)
    db.commit()
    db.refresh(rubric)
    return rubric


def delete_rubric(db: Session, rubric: Rubric) -> None:
    db.delete(rubric)
    db.commit()


# ── Criteria ──────────────────────────────────────────────────────────────────

def create_criterion(db: Session, data: RubricCriterionCreate) -> RubricCriterion:
    item = RubricCriterion(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_criterion(db: Session, item: RubricCriterion, data: RubricCriterionUpdate) -> RubricCriterion:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_criterion(db: Session, item: RubricCriterion) -> None:
    db.delete(item)
    db.commit()


# ── Grade Entries ─────────────────────────────────────────────────────────────

def get_grade_entries(db: Session) -> list[GradeEntry]:
    return (
        db.query(GradeEntry)
        .options(joinedload(GradeEntry.rubric))
        .order_by(GradeEntry.created_at.desc())
        .all()
    )


def create_grade_entry(db: Session, data: GradeEntryCreate) -> GradeEntry:
    rubric = db.query(Rubric).filter(Rubric.id == data.rubric_id).first()
    if not rubric:
        raise ValueError(f"Rubric {data.rubric_id} not found")
    valid_criteria = {str(c.id): c.max_points for c in rubric.criteria}
    total_possible = sum(valid_criteria.values())
    total_earned = sum(
        min(float(v), valid_criteria[k])
        for k, v in data.scores.items()
        if k in valid_criteria
    )
    pct = (total_earned / total_possible * 100) if total_possible > 0 else 0.0

    entry = GradeEntry(
        rubric_id=data.rubric_id,
        label=data.label,
        scores_json=json.dumps(data.scores),
        total_earned=round(total_earned, 2),
        total_possible=round(total_possible, 2),
        percentage=round(pct, 1),
        letter_grade=_letter_grade(pct),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_grade_entry(db: Session, entry: GradeEntry) -> None:
    db.delete(entry)
    db.commit()
