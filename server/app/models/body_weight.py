from sqlalchemy import Column, Integer, Float, String, Date
from ..database import Base

class BodyWeight(Base):
    __tablename__ = "body_weights"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)
    weight_lbs = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
