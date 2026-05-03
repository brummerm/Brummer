from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class TagBase(BaseModel):
    name: str
    color: str = "#6aa2ff"


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagOut(TagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class NoteBase(BaseModel):
    title: str = "Untitled"
    content: str = ""
    pinned: bool = False
    color: str = ""


class NoteCreate(NoteBase):
    tag_ids: list[int] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    pinned: Optional[bool] = None
    color: Optional[str] = None
    tag_ids: Optional[list[int]] = None


class NoteOut(NoteBase):
    id: int
    tags: list[TagOut] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
