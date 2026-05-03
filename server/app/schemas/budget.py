from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


# ── Income ────────────────────────────────────────────────────────────────────

class IncomeItemBase(BaseModel):
    label: str
    amount: float
    sort_order: int = 0


class IncomeItemCreate(IncomeItemBase):
    pass


class IncomeItemUpdate(BaseModel):
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


# ── Month Snapshots ───────────────────────────────────────────────────────────

class MonthSnapshotOut(BaseModel):
    id: int
    month: str
    income: float
    total_expenses: float
    surplus: float
    savings_rate: float
    net_worth: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Actual Spending ───────────────────────────────────────────────────────────

class ActualSpendingItem(BaseModel):
    category: str
    budgeted: float
    actual: float


class ActualSpendingOut(ActualSpendingItem):
    id: int
    month: str
    model_config = ConfigDict(from_attributes=True)


class ActualSpendingBatch(BaseModel):
    month: str
    items: list[ActualSpendingItem]


# ── Debt Accounts ─────────────────────────────────────────────────────────────

class DebtAccountBase(BaseModel):
    name: str
    account_type: str
    balance: float
    interest_rate: float
    minimum_payment: float
    extra_payment: float = 0.0


class DebtAccountCreate(DebtAccountBase):
    pass


class DebtAccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[float] = None
    interest_rate: Optional[float] = None
    minimum_payment: Optional[float] = None
    extra_payment: Optional[float] = None


class DebtAccountOut(DebtAccountBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Summary ───────────────────────────────────────────────────────────────────

class BudgetSummary(BaseModel):
    total_income: float
    total_expenses: float
    surplus: float
    savings_rate: float
    expenses_by_category: dict[str, float]
    net_worth: float
