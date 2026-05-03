from sqlalchemy import Column, Integer, String, Float, Date, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from ..database import Base


class IncomeItem(Base):
    __tablename__ = "income_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    person = Column(String, nullable=True)   # legacy column, kept for SQLite compat
    label = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    sort_order = Column(Integer, default=0)


class ExpenseItem(Base):
    __tablename__ = "expense_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
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


class MonthSnapshot(Base):
    """One row per calendar month — saved manually via the Dashboard."""
    __tablename__ = "month_snapshots"
    id = Column(Integer, primary_key=True, autoincrement=True)
    month = Column(String, nullable=False, unique=True)   # "2026-05"
    income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    surplus = Column(Float, default=0.0)
    savings_rate = Column(Float, default=0.0)
    net_worth = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActualSpending(Base):
    """Actual spending per category per month for budget-vs-actual tracking."""
    __tablename__ = "actual_spending"
    id = Column(Integer, primary_key=True, autoincrement=True)
    month = Column(String, nullable=False)   # "2026-05"
    category = Column(String, nullable=False)
    budgeted = Column(Float, default=0.0)
    actual = Column(Float, default=0.0)
    __table_args__ = (UniqueConstraint("month", "category", name="uq_actual_month_cat"),)


class SavingsAccount(Base):
    __tablename__ = "savings_accounts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False, default="savings")  # checking | savings | money_market | cd | other
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DebtAccount(Base):
    __tablename__ = "debt_accounts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)   # credit_card | student_loan | personal | other
    balance = Column(Float, default=0.0)
    interest_rate = Column(Float, default=0.0)      # APR as decimal, e.g. 0.20
    minimum_payment = Column(Float, default=0.0)
    extra_payment = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
