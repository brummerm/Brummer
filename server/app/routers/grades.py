from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..crud import grades as crud
from ..models.grades import RubricCriterion, GradeEntry
from ..schemas.grades import (
    RubricCreate, RubricUpdate, RubricOut, RubricWithCriteria,
    RubricCriterionCreate, RubricCriterionUpdate, RubricCriterionOut,
    GradeEntryCreate, GradeEntryOut,
)

router = APIRouter(tags=["grades"])


# ── Rubrics ───────────────────────────────────────────────────────────────────

@router.get("/rubrics", response_model=list[RubricOut])
def list_rubrics(db: Session = Depends(get_db)):
    return crud.get_rubrics(db)


@router.post("/rubrics", response_model=RubricOut, status_code=201)
def create_rubric(data: RubricCreate, db: Session = Depends(get_db)):
    return crud.create_rubric(db, data)


@router.get("/rubrics/{rubric_id}", response_model=RubricWithCriteria)
def get_rubric(rubric_id: int, db: Session = Depends(get_db)):
    rubric = crud.get_rubric(db, rubric_id)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    return rubric


@router.put("/rubrics/{rubric_id}", response_model=RubricOut)
def update_rubric(rubric_id: int, data: RubricUpdate, db: Session = Depends(get_db)):
    rubric = crud.get_rubric(db, rubric_id)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    return crud.update_rubric(db, rubric, data)


@router.delete("/rubrics/{rubric_id}", status_code=204)
def delete_rubric(rubric_id: int, db: Session = Depends(get_db)):
    rubric = crud.get_rubric(db, rubric_id)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    crud.delete_rubric(db, rubric)
    return Response(status_code=204)


# ── Criteria ──────────────────────────────────────────────────────────────────

@router.post("/criteria", response_model=RubricCriterionOut, status_code=201)
def add_criterion(data: RubricCriterionCreate, db: Session = Depends(get_db)):
    return crud.create_criterion(db, data)


@router.put("/criteria/{criterion_id}", response_model=RubricCriterionOut)
def update_criterion(criterion_id: int, data: RubricCriterionUpdate, db: Session = Depends(get_db)):
    item = db.query(RubricCriterion).filter(RubricCriterion.id == criterion_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Criterion not found")
    return crud.update_criterion(db, item, data)


@router.delete("/criteria/{criterion_id}", status_code=204)
def delete_criterion(criterion_id: int, db: Session = Depends(get_db)):
    item = db.query(RubricCriterion).filter(RubricCriterion.id == criterion_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Criterion not found")
    crud.delete_criterion(db, item)
    return Response(status_code=204)


# ── Grade Entries ─────────────────────────────────────────────────────────────

@router.get("/entries", response_model=list[GradeEntryOut])
def list_grade_entries(db: Session = Depends(get_db)):
    entries = crud.get_grade_entries(db)
    return [
        {
            "id": e.id, "rubric_id": e.rubric_id,
            "rubric_name": e.rubric.name if e.rubric else "",
            "label": e.label, "scores_json": e.scores_json,
            "total_earned": e.total_earned, "total_possible": e.total_possible,
            "percentage": e.percentage, "letter_grade": e.letter_grade,
            "created_at": e.created_at,
        }
        for e in entries
    ]


@router.post("/entries", response_model=GradeEntryOut, status_code=201)
def save_grade_entry(data: GradeEntryCreate, db: Session = Depends(get_db)):
    rubric = crud.get_rubric(db, data.rubric_id)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    entry = crud.create_grade_entry(db, data)
    return {
        "id": entry.id, "rubric_id": entry.rubric_id,
        "rubric_name": rubric.name,
        "label": entry.label, "scores_json": entry.scores_json,
        "total_earned": entry.total_earned, "total_possible": entry.total_possible,
        "percentage": entry.percentage, "letter_grade": entry.letter_grade,
        "created_at": entry.created_at,
    }


@router.delete("/entries/{entry_id}", status_code=204)
def delete_grade_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(GradeEntry).filter(GradeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Grade entry not found")
    crud.delete_grade_entry(db, entry)
    return Response(status_code=204)
