from __future__ import annotations
from pydantic import BaseModel
from datetime import date
from typing import Optional


class ExerciseIn(BaseModel):
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0

class ExerciseOut(ExerciseIn):
    id: int
    class Config: from_attributes = True

class RunIn(BaseModel):
    distance_miles: Optional[float] = None
    duration_minutes: Optional[float] = None
    notes: Optional[str] = None

class RunOut(RunIn):
    id: int
    class Config: from_attributes = True

class WorkoutEntryCreate(BaseModel):
    date: date
    workout_type: str  # lift|run|rest|hike|custom
    custom_type_label: Optional[str] = None
    title: Optional[str] = None
    status: str = "planned"
    notes: Optional[str] = None
    exercises: list[ExerciseIn] = []
    run: Optional[RunIn] = None

class WorkoutEntryUpdate(BaseModel):
    date: Optional[date] = None
    workout_type: Optional[str] = None
    custom_type_label: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    exercises: Optional[list[ExerciseIn]] = None
    run: Optional[RunIn] = None

class WorkoutEntryOut(BaseModel):
    id: int
    date: date
    workout_type: str
    custom_type_label: Optional[str]
    title: Optional[str]
    status: str
    notes: Optional[str]
    exercises: list[ExerciseOut]
    run: Optional[RunOut]
    class Config: from_attributes = True

class TemplateExerciseIn(BaseModel):
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0

class TemplateExerciseOut(TemplateExerciseIn):
    id: int
    class Config: from_attributes = True

class WorkoutTemplateCreate(BaseModel):
    name: str
    workout_type: str
    custom_type_label: Optional[str] = None
    notes: Optional[str] = None
    exercises: list[TemplateExerciseIn] = []

class WorkoutTemplateUpdate(BaseModel):
    name: Optional[str] = None
    workout_type: Optional[str] = None
    custom_type_label: Optional[str] = None
    notes: Optional[str] = None
    exercises: Optional[list[TemplateExerciseIn]] = None

class WorkoutTemplateOut(BaseModel):
    id: int
    name: str
    workout_type: str
    custom_type_label: Optional[str]
    notes: Optional[str]
    exercises: list[TemplateExerciseOut]
    class Config: from_attributes = True
