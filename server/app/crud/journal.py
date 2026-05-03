from __future__ import annotations
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from ..models.journal import Note, Tag
from ..schemas.journal import NoteCreate, NoteUpdate, TagCreate, TagUpdate


# ── Tags ──────────────────────────────────────────────────────────────────────

def get_tags(db: Session) -> list[Tag]:
    return db.query(Tag).order_by(Tag.name).all()


def create_tag(db: Session, data: TagCreate) -> Tag:
    tag = Tag(**data.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag: Tag, data: TagUpdate) -> Tag:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.commit()


# ── Notes ─────────────────────────────────────────────────────────────────────

def get_notes(db: Session, search: str | None = None, tag_id: int | None = None) -> list[Note]:
    q = db.query(Note).options(joinedload(Note.tags))
    if search:
        q = q.filter(or_(Note.title.ilike(f"%{search}%"), Note.content.ilike(f"%{search}%")))
    if tag_id:
        q = q.filter(Note.tags.any(Tag.id == tag_id))
    return q.order_by(Note.pinned.desc(), Note.updated_at.desc()).all()


def get_note(db: Session, note_id: int) -> Note | None:
    return db.query(Note).filter(Note.id == note_id).first()


def create_note(db: Session, data: NoteCreate) -> Note:
    tag_ids = data.tag_ids
    note_data = data.model_dump(exclude={"tag_ids"})
    note = Note(**note_data)
    if tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        note.tags = tags
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note: Note, data: NoteUpdate) -> Note:
    update_data = data.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)
    for field, value in update_data.items():
        setattr(note, field, value)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        note.tags = tags
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note) -> None:
    db.delete(note)
    db.commit()
