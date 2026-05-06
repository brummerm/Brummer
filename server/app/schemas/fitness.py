from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List


class ExerciseIn(BaseModel):
    model_config = ConfigDict(extra='ignore')
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0

class ExerciseOut(ExerciseIn):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int

class RunIn(BaseModel):
    model_config = ConfigDict(extra='ignore')
    distance_miles: Optional[float] = None
    duration_minutes: Optional[float] = None
    notes: Optional[str] = None

class RunOut(RunIn):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int

class WorkoutEntryCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    date: date
    workout_type: str  # lift|run|rest|hike|custom
    custom_type_label: Optional[str] = None
    title: Optional[str] = None
    status: str = "planned"
    notes: Optional[str] = None
    exercises: list[ExerciseIn] = []
    run: Optional[RunIn] = None

class WorkoutEntryUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    date: Optional[date] = None
    workout_type: Optional[str] = None
    custom_type_label: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    exercises: Optional[list[ExerciseIn]] = None
    run: Optional[RunIn] = None

class WorkoutEntryOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    date: date
    workout_type: str
    custom_type_label: Optional[str]
    title: Optional[str]
    status: str
    notes: Optional[str]
    exercises: list[ExerciseOut]
    run: Optional[RunOut]

class TemplateExerciseIn(BaseModel):
    model_config = ConfigDict(extra='ignore')
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0

class TemplateExerciseOut(TemplateExerciseIn):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int

class WorkoutTemplateCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str
    workout_type: str
    custom_type_label: Optional[str] = None
    notes: Optional[str] = None
    exercises: list[TemplateExerciseIn] = []

class WorkoutTemplateUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = None
    workout_type: Optional[str] = None
    custom_type_label: Optional[str] = None
    notes: Optional[str] = None
    exercises: Optional[list[TemplateExerciseIn]] = None

class WorkoutTemplateOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    name: str
    workout_type: str
    custom_type_label: Optional[str]
    notes: Optional[str]
    exercises: list[TemplateExerciseOut]
