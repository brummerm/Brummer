from sqlalchemy import Integer, String, Text, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from ..database import Base


class FitnessPlanConfig(Base):
    __tablename__ = "fitness_plan_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    start_date: Mapped[object] = mapped_column(Date, nullable=False)


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_day_index: Mapped[int] = mapped_column(Integer, nullable=False)
    logged_date: Mapped[object] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    exercises: Mapped[list["ExerciseSet"]] = relationship(
        "ExerciseSet", back_populates="workout", cascade="all, delete"
    )
    run: Mapped["RunEntry | None"] = relationship(
        "RunEntry", back_populates="workout", uselist=False, cascade="all, delete"
    )


class ExerciseSet(Base):
    __tablename__ = "exercise_sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_log_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("workout_logs.id"), nullable=False
    )
    exercise_name: Mapped[str] = mapped_column(String, nullable=False)
    sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps: Mapped[str | None] = mapped_column(String, nullable=True)
    weight: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    workout: Mapped["WorkoutLog"] = relationship("WorkoutLog", back_populates="exercises")


class RunEntry(Base):
    __tablename__ = "run_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_log_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("workout_logs.id"), nullable=False
    )
    distance_miles: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    workout: Mapped["WorkoutLog"] = relationship("WorkoutLog", back_populates="run")
