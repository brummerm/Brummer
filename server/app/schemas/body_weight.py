from pydantic import BaseModel
from datetime import date

class BodyWeightCreate(BaseModel):
    date: date
    weight_lbs: float
    notes: str | None = None

class BodyWeightUpdate(BaseModel):
    weight_lbs: float | None = None
    notes: str | None = None

class BodyWeightResponse(BaseModel):
    id: int
    date: date
    weight_lbs: float
    notes: str | None
    class Config:
        from_attributes = True
