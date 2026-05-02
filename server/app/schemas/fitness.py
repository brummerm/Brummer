from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


class ExerciseSetBase(BaseModel):
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


class ExerciseSetCreate(ExerciseSetBase):
    pass


class ExerciseSetOut(ExerciseSetBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RunEntryBase(BaseModel):
    distance_miles: Optional[float] = None
    duration_minutes: Optional[float] = None
    notes: Optional[str] = None


class RunEntryCreate(RunEntryBase):
    pass


class RunEntryOut(RunEntryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class WorkoutLogCreate(BaseModel):
    plan_day_index: int
    logged_date: date
    notes: Optional[str] = None
    exercises: list[ExerciseSetCreate] = []
    run: Optional[RunEntryCreate] = None


class WorkoutLogOut(BaseModel):
    id: int
    plan_day_index: int
    logged_date: date
    notes: Optional[str] = None
    exercises: list[ExerciseSetOut]
    run: Optional[RunEntryOut] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PlanConfigOut(BaseModel):
    id: int
    start_date: date
    model_config = ConfigDict(from_attributes=True)


class PlanConfigCreate(BaseModel):
    start_date: date
