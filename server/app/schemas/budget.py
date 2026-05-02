from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


# ── Income ────────────────────────────────────────────────────────────────────

class IncomeItemBase(BaseModel):
    person: str
    label: str
    amount: float
    sort_order: int = 0


class IncomeItemCreate(IncomeItemBase):
    pass


class IncomeItemUpdate(BaseModel):
    person: Optional[str] = None
    label: Optional[str] = None
    amount: Optional[float] = None
    sort_order: Optional[int] = None


class IncomeItemOut(IncomeItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Expenses ──────────────────────────────────────────────────────────────────

class ExpenseItemBase(BaseModel):
    category: str
    label: str
    amount: float
    sort_order: int = 0


class ExpenseItemCreate(ExpenseItemBase):
    pass


class ExpenseItemUpdate(BaseModel):
    category: Optional[str] = None
    label: Optional[str] = None
    amount: Optional[float] = None
    sort_order: Optional[int] = None


class ExpenseItemOut(ExpenseItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Surplus Allocations ───────────────────────────────────────────────────────

class SurplusAllocationBase(BaseModel):
    label: str
    percentage: float
    sort_order: int = 0


class SurplusAllocationCreate(SurplusAllocationBase):
    pass


class SurplusAllocationUpdate(BaseModel):
    label: Optional[str] = None
    percentage: Optional[float] = None
    sort_order: Optional[int] = None


class SurplusAllocationOut(SurplusAllocationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Retirement ────────────────────────────────────────────────────────────────

class RetirementEntryBase(BaseModel):
    account_name: str
    balance: float
    recorded_date: date


class RetirementEntryCreate(RetirementEntryBase):
    pass


class RetirementEntryOut(RetirementEntryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Summary ───────────────────────────────────────────────────────────────────

class BudgetSummary(BaseModel):
    matthew_income: float
    alyssa_income: float
    combined_income: float
    shared_expenses: float
    matthew_expenses: float
    alyssa_expenses: float
    total_expenses: float
    surplus: float
    savings_rate: float
