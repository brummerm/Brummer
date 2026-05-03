from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..crud import journal as crud
from ..models.journal import Tag
from ..schemas.journal import (
    NoteCreate, NoteUpdate, NoteOut,
    TagCreate, TagUpdate, TagOut,
)

router = APIRouter(tags=["journal"])


# ── Tags ──────────────────────────────────────────────────────────────────────

@router.get("/tags", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)


@router.post("/tags", response_model=TagOut, status_code=201)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db, data)


@router.put("/tags/{tag_id}", response_model=TagOut)
def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud.update_tag(db, tag, data)


@router.delete("/tags/{tag_id}", status_code=204)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    crud.delete_tag(db, tag)
    return Response(status_code=204)


# ── Notes ─────────────────────────────────────────────────────────────────────

@router.get("/notes", response_model=list[NoteOut])
def list_notes(
    search: Optional[str] = Query(None),
    tag_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_notes(db, search=search, tag_id=tag_id)


@router.post("/notes", response_model=NoteOut, status_code=201)
def create_note(data: NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db, data)


@router.get("/notes/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = crud.get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db)):
    note = crud.get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return crud.update_note(db, note, data)


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = crud.get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db, note)
    return Response(status_code=204)
