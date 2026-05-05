from sqlalchemy import Integer, String, Text, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from ..database import Base


class WorkoutEntry(Base):
    __tablename__ = "workout_entries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[object] = mapped_column(Date, nullable=False, index=True)
    workout_type: Mapped[str] = mapped_column(String, nullable=False)  # lift|run|rest|hike|custom
    custom_type_label: Mapped[str | None] = mapped_column(String, nullable=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="planned")  # planned|completed
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    exercises: Mapped[list["WorkoutExercise"]] = relationship(
        "WorkoutExercise", back_populates="workout", cascade="all, delete",
        order_by="WorkoutExercise.sort_order"
    )
    run: Mapped["WorkoutRun | None"] = relationship(
        "WorkoutRun", back_populates="workout", uselist=False, cascade="all, delete"
    )


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_entry_id: Mapped[int] = mapped_column(Integer, ForeignKey("workout_entries.id"), nullable=False)
    exercise_name: Mapped[str] = mapped_column(String, nullable=False)
    sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps: Mapped[str | None] = mapped_column(String, nullable=True)
    weight: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    workout: Mapped["WorkoutEntry"] = relationship("WorkoutEntry", back_populates="exercises")


class WorkoutRun(Base):
    __tablename__ = "workout_runs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_entry_id: Mapped[int] = mapped_column(Integer, ForeignKey("workout_entries.id"), nullable=False)
    distance_miles: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    workout: Mapped["WorkoutEntry"] = relationship("WorkoutEntry", back_populates="run")


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    workout_type: Mapped[str] = mapped_column(String, nullable=False)
    custom_type_label: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    exercises: Mapped[list["WorkoutTemplateExercise"]] = relationship(
        "WorkoutTemplateExercise", back_populates="template", cascade="all, delete",
        order_by="WorkoutTemplateExercise.sort_order"
    )


class WorkoutTemplateExercise(Base):
    __tablename__ = "workout_template_exercises"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(Integer, ForeignKey("workout_templates.id"), nullable=False)
    exercise_name: Mapped[str] = mapped_column(String, nullable=False)
    sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps: Mapped[str | None] = mapped_column(String, nullable=True)
    weight: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    template: Mapped["WorkoutTemplate"] = relationship("WorkoutTemplate", back_populates="exercises")
