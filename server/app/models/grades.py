from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Rubric(Base):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    subject = Column(String, default="")
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    criteria = relationship(
        "RubricCriterion", back_populates="rubric",
        cascade="all, delete-orphan",
        order_by="RubricCriterion.sort_order",
    )
    grade_entries = relationship("GradeEntry", back_populates="rubric", cascade="all, delete-orphan")


class RubricCriterion(Base):
    __tablename__ = "rubric_criteria"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    max_points = Column(Float, nullable=False, default=10.0)
    sort_order = Column(Integer, default=0)

    rubric = relationship("Rubric", back_populates="criteria")


class GradeEntry(Base):
    __tablename__ = "grade_entries"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), nullable=False)
    label = Column(String, nullable=False)  # e.g. "Assignment 1", "Student A"
    scores_json = Column(Text, default="{}")  # JSON: {"criterion_id": points_earned}
    total_earned = Column(Float, default=0.0)
    total_possible = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    letter_grade = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rubric = relationship("Rubric", back_populates="grade_entries")
