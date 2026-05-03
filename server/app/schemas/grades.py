from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class RubricCriterionBase(BaseModel):
    name: str
    description: str = ""
    max_points: float = 10.0
    sort_order: int = 0


class RubricCriterionCreate(RubricCriterionBase):
    rubric_id: int


class RubricCriterionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_points: Optional[float] = None
    sort_order: Optional[int] = None


class RubricCriterionOut(RubricCriterionBase):
    id: int
    rubric_id: int
    model_config = ConfigDict(from_attributes=True)


class RubricBase(BaseModel):
    name: str
    subject: str = ""
    description: str = ""


class RubricCreate(RubricBase):
    pass


class RubricUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None


class RubricOut(RubricBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RubricWithCriteria(RubricOut):
    criteria: list[RubricCriterionOut] = []


class GradeEntryCreate(BaseModel):
    rubric_id: int
    label: str
    scores: dict[str, float]  # {str(criterion_id): points_earned}


class GradeEntryOut(BaseModel):
    id: int
    rubric_id: int
    rubric_name: str
    label: str
    scores_json: str
    total_earned: float
    total_possible: float
    percentage: float
    letter_grade: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
