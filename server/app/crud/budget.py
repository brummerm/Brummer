from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session

from ..models.budget import IncomeItem, ExpenseItem, SurplusAllocation, RetirementEntry
from ..schemas.budget import (
    IncomeItemCreate, IncomeItemUpdate,
    ExpenseItemCreate, ExpenseItemUpdate,
    SurplusAllocationUpdate,
    RetirementEntryCreate,
    BudgetSummary,
)

# ── Seed data ─────────────────────────────────────────────────────────────────

_INCOME_SEED = [
    # (person, label, amount, sort_order)
    ("matthew", "Primary Salary / Take-Home Pay", 4244.98, 0),
    ("matthew", "Part-Time / Adjunct Pay", 1441.00, 1),
    ("matthew", "VA Disability (non-taxable)", 615.00, 2),
    ("matthew", "Other Income", 500.00, 3),
    ("alyssa", "Primary Salary / Take-Home Pay", 5164.00, 0),
]

_EXPENSE_SEED = [
    # (category, label, amount, sort_order)
    ("shared", "Rent / Mortgage", 2825.00, 0),
    ("shared", "Utilities (electric, gas)", 200.00, 1),
    ("shared", "Internet / Phone", 79.00, 2),
    ("shared", "Groceries", 447.19, 3),
    ("shared", "Pets", 112.23, 4),
    ("shared", "Dining Out", 600.00, 5),
    ("shared", "Transportation / MetroCard", 380.00, 6),
    ("shared", "Subscriptions", 202.72, 7),
    ("shared", "Health & Wellness", 100.00, 8),
    ("shared", "Entertainment", 100.00, 9),
    ("shared", "Other Shared", 0.00, 10),
    ("matthew", "Credit Card Payment", 1000.00, 0),
    ("matthew", "Student Loan Payment", 1128.54, 1),
    ("matthew", "Personal Loans", 253.83, 2),
    ("matthew", "Savings / Investments", 500.00, 3),
    ("matthew", "Personal Spending", 200.00, 4),
    ("alyssa", "Student Loan / Debt Payments", 110.00, 0),
    ("alyssa", "Credit Card Payment", 500.00, 1),
    ("alyssa", "Savings / Investments", 0.00, 2),
    ("alyssa", "Personal Spending", 0.00, 3),
    ("alyssa", "Other", 0.00, 4),
]

_ALLOCATION_SEED = [
    # (label, percentage, sort_order)
    ("Emergency Fund", 0.20, 0),
    ("Debt Payoff (Extra)", 0.40, 1),
    ("Retirement / Invest", 0.20, 2),
    ("Fun / Travel", 0.10, 3),
    ("Other Savings", 0.10, 4),
]

_RETIREMENT_SEED = [
    # (account_name, balance)
    ("TSP", 12309.00),
    ("TRS", 9233.00),
    ("TDA", 7647.00),
    ("NavyFed", 803.00),
]


def seed_defaults(db: Session) -> None:
    """Populate all budget tables with default data if they are empty."""
    if db.query(IncomeItem).count() == 0:
        for person, label, amount, sort_order in _INCOME_SEED:
            db.add(IncomeItem(person=person, label=label, amount=amount, sort_order=sort_order))

    if db.query(ExpenseItem).count() == 0:
        for category, label, amount, sort_order in _EXPENSE_SEED:
            db.add(ExpenseItem(category=category, label=label, amount=amount, sort_order=sort_order))

    if db.query(SurplusAllocation).count() == 0:
        for label, percentage, sort_order in _ALLOCATION_SEED:
            db.add(SurplusAllocation(label=label, percentage=percentage, sort_order=sort_order))

    if db.query(RetirementEntry).count() == 0:
        seed_date = date(2026, 5, 1)
        for account_name, balance in _RETIREMENT_SEED:
            db.add(RetirementEntry(account_name=account_name, balance=balance, recorded_date=seed_date))

    db.commit()


# ── Income CRUD ───────────────────────────────────────────────────────────────

def get_income(db: Session) -> list[IncomeItem]:
    return db.query(IncomeItem).order_by(IncomeItem.person, IncomeItem.sort_order).all()


def create_income(db: Session, data: IncomeItemCreate) -> IncomeItem:
    item = IncomeItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_income(db: Session, item: IncomeItem, data: IncomeItemUpdate) -> IncomeItem:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_income(db: Session, item: IncomeItem) -> None:
    db.delete(item)
    db.commit()


# ── Expense CRUD ──────────────────────────────────────────────────────────────

def get_expenses(db: Session) -> list[ExpenseItem]:
    return db.query(ExpenseItem).order_by(ExpenseItem.category, ExpenseItem.sort_order).all()


def create_expense(db: Session, data: ExpenseItemCreate) -> ExpenseItem:
    item = ExpenseItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_expense(db: Session, item: ExpenseItem, data: ExpenseItemUpdate) -> ExpenseItem:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_expense(db: Session, item: ExpenseItem) -> None:
    db.delete(item)
    db.commit()


# ── Surplus Allocation CRUD ───────────────────────────────────────────────────

def get_allocations(db: Session) -> list[SurplusAllocation]:
    return db.query(SurplusAllocation).order_by(SurplusAllocation.sort_order).all()


def update_allocation(db: Session, item: SurplusAllocation, data: SurplusAllocationUpdate) -> SurplusAllocation:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


# ── Retirement CRUD ───────────────────────────────────────────────────────────

def get_retirement(db: Session) -> list[RetirementEntry]:
    return (
        db.query(RetirementEntry)
        .order_by(RetirementEntry.recorded_date.desc(), RetirementEntry.account_name)
        .all()
    )


def create_retirement(db: Session, data: RetirementEntryCreate) -> RetirementEntry:
    entry = RetirementEntry(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_retirement(db: Session, entry: RetirementEntry) -> None:
    db.delete(entry)
    db.commit()


# ── Summary ───────────────────────────────────────────────────────────────────

def get_summary(db: Session) -> BudgetSummary:
    income_items = get_income(db)
    expense_items = get_expenses(db)

    matthew_income = sum(i.amount for i in income_items if i.person == "matthew")
    alyssa_income = sum(i.amount for i in income_items if i.person == "alyssa")
    combined_income = matthew_income + alyssa_income

    shared_expenses = sum(e.amount for e in expense_items if e.category == "shared")
    matthew_expenses = sum(e.amount for e in expense_items if e.category == "matthew")
    alyssa_expenses = sum(e.amount for e in expense_items if e.category == "alyssa")
    total_expenses = shared_expenses + matthew_expenses + alyssa_expenses

    surplus = combined_income - total_expenses
    savings_rate = (surplus / combined_income) if combined_income > 0 else 0.0

    return BudgetSummary(
        matthew_income=matthew_income,
        alyssa_income=alyssa_income,
        combined_income=combined_income,
        shared_expenses=shared_expenses,
        matthew_expenses=matthew_expenses,
        alyssa_expenses=alyssa_expenses,
        total_expenses=total_expenses,
        surplus=surplus,
        savings_rate=savings_rate,
    )
