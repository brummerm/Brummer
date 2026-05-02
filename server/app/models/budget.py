from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from ..database import Base


class IncomeItem(Base):
    __tablename__ = "income_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    person = Column(String, nullable=False)  # "matthew" | "alyssa"
    label = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    sort_order = Column(Integer, default=0)


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)  # "shared" | "matthew" | "alyssa"
    label = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    sort_order = Column(Integer, default=0)


class SurplusAllocation(Base):
    __tablename__ = "surplus_allocations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String, nullable=False)
    percentage = Column(Float, default=0.0)
    sort_order = Column(Integer, default=0)


class RetirementEntry(Base):
    __tablename__ = "retirement_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_name = Column(String, nullable=False)
    balance = Column(Float, nullable=False)
    recorded_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
