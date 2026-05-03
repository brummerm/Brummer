from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session

from ..models.budget import (
    IncomeItem, ExpenseItem, SurplusAllocation, RetirementEntry,
    MonthSnapshot, ActualSpending, DebtAccount,
)
from ..schemas.budget import (
    IncomeItemCreate, IncomeItemUpdate,
    ExpenseItemCreate, ExpenseItemUpdate,
    SurplusAllocationCreate, SurplusAllocationUpdate,
    RetirementEntryCreate,
    ActualSpendingBatch,
    DebtAccountCreate, DebtAccountUpdate,
    BudgetSummary,
)

# ── Seed / migration data ─────────────────────────────────────────────────────

_INCOME_SEED = [
    ("Take-Home Pay",            4244.98, 0),
    ("Adjunct / Part-Time Pay",  1441.00, 1),
    ("VA Disability",             615.00, 2),
    ("Other Income",              500.00, 3),
]

_EXPENSE_SEED = [
    ("Housing",       "Rent / Mortgage",          2825.00, 0),
    ("Housing",       "Utilities",                  200.00, 1),
    ("Housing",       "Internet / Phone",            79.00, 2),
    ("Food",          "Groceries",                  447.19, 0),
    ("Food",          "Dining Out",                 600.00, 1),
    ("Transport",     "MetroCard / Transit",         380.00, 0),
    ("Debt",          "Credit Card Payment",        1000.00, 0),
    ("Debt",          "Student Loan Payment",       1128.54, 1),
    ("Debt",          "Personal Loans",              253.83, 2),
    ("Health",        "Health & Wellness",           100.00, 0),
    ("Entertainment", "Entertainment",               100.00, 0),
    ("Subscriptions", "Subscriptions",               202.72, 0),
    ("Savings",       "Savings / Investments",       500.00, 0),
    ("Personal",      "Personal Spending",           200.00, 0),
]

_ALLOCATION_SEED = [
    ("Emergency Fund",      0.20, 0),
    ("Debt Payoff (Extra)", 0.40, 1),
    ("Retirement / Invest", 0.20, 2),
    ("Fun / Travel",        0.10, 3),
    ("Other Savings",       0.10, 4),
]

_RETIREMENT_SEED = [
    ("TSP",      12309.00),
    ("TRS",       9233.00),
    ("TDA",       7647.00),
    ("NavyFed",    803.00),
]

_DEBT_SEED = [
    ("Credit Card",   "credit_card",   0.0,  0.20,   1000.00),
    ("Student Loan",  "student_loan",  0.0,  0.065,  1128.54),
    ("Personal Loan", "personal",      0.0,  0.10,    253.83),
]

_NEW_CATEGORIES = {"Housing", "Food", "Transport", "Debt", "Health",
                   "Entertainment", "Subscriptions", "Savings", "Personal", "Other"}
_OLD_CATEGORIES = {"shared", "matthew", "alyssa"}


def seed_defaults(db: Session) -> None:
    if db.query(IncomeItem).count() == 0:
        for label, amount, sort_order in _INCOME_SEED:
            db.add(IncomeItem(person="matthew", label=label, amount=amount, sort_order=sort_order))

    if db.query(ExpenseItem).count() == 0:
        for category, label, amount, sort_order in _EXPENSE_SEED:
            db.add(ExpenseItem(category=category, label=label, amount=amount, sort_order=sort_order))

    if db.query(SurplusAllocation).count() == 0:
        for label, pct, sort_order in _ALLOCATION_SEED:
            db.add(SurplusAllocation(label=label, percentage=pct, sort_order=sort_order))

    if db.query(RetirementEntry).count() == 0:
        seed_date = date(2026, 5, 1)
        for account_name, balance in _RETIREMENT_SEED:
            db.add(RetirementEntry(account_name=account_name, balance=balance, recorded_date=seed_date))

    if db.query(DebtAccount).count() == 0:
        for name, acct_type, balance, rate, min_pay in _DEBT_SEED:
            db.add(DebtAccount(name=name, account_type=acct_type, balance=balance,
                               interest_rate=rate, minimum_payment=min_pay))

    db.commit()


def migrate_data(db: Session) -> None:
    """Remove Alyssa's data and migrate old expense categories to new ones."""
    # Remove Alyssa income items
    db.query(IncomeItem).filter(IncomeItem.person == "alyssa").delete()

    # If any expense items still use old person-based categories, replace them all
    existing_cats = {r[0] for r in db.query(ExpenseItem.category).distinct()}
    if existing_cats & _OLD_CATEGORIES:
        db.query(ExpenseItem).delete()
        for category, label, amount, sort_order in _EXPENSE_SEED:
            db.add(ExpenseItem(category=category, label=label, amount=amount, sort_order=sort_order))

    db.commit()


# ── Income ────────────────────────────────────────────────────────────────────

def get_income(db: Session) -> list[IncomeItem]:
    return (db.query(IncomeItem)
              .filter(IncomeItem.person != "alyssa")
              .order_by(IncomeItem.sort_order)
              .all())


def create_income(db: Session, data: IncomeItemCreate) -> IncomeItem:
    item = IncomeItem(person="matthew", label=data.label, amount=data.amount, sort_order=data.sort_order)
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


# ── Expenses ──────────────────────────────────────────────────────────────────

def get_expenses(db: Session) -> list[ExpenseItem]:
    return (db.query(ExpenseItem)
              .order_by(ExpenseItem.category, ExpenseItem.sort_order)
              .all())


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


# ── Surplus Allocations ───────────────────────────────────────────────────────

def get_allocations(db: Session) -> list[SurplusAllocation]:
    return db.query(SurplusAllocation).order_by(SurplusAllocation.sort_order).all()


def create_allocation(db: Session, data: SurplusAllocationCreate) -> SurplusAllocation:
    item = SurplusAllocation(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_allocation(db: Session, item: SurplusAllocation, data: SurplusAllocationUpdate) -> SurplusAllocation:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_allocation(db: Session, item: SurplusAllocation) -> None:
    db.delete(item)
    db.commit()


# ── Retirement ────────────────────────────────────────────────────────────────

def get_retirement(db: Session) -> list[RetirementEntry]:
    return (db.query(RetirementEntry)
              .order_by(RetirementEntry.recorded_date.desc(), RetirementEntry.account_name)
              .all())


def create_retirement(db: Session, data: RetirementEntryCreate) -> RetirementEntry:
    entry = RetirementEntry(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_retirement(db: Session, entry: RetirementEntry) -> None:
    db.delete(entry)
    db.commit()


# ── Month Snapshots ───────────────────────────────────────────────────────────

def get_snapshots(db: Session) -> list[MonthSnapshot]:
    return db.query(MonthSnapshot).order_by(MonthSnapshot.month).all()


def save_snapshot(db: Session, month: str) -> MonthSnapshot:
    """Create or replace the snapshot for the given month using live data."""
    income_items = get_income(db)
    expense_items = get_expenses(db)

    total_income = sum(i.amount for i in income_items)
    total_expenses = sum(e.amount for e in expense_items)
    surplus = total_income - total_expenses
    savings_rate = (surplus / total_income) if total_income > 0 else 0.0
    net_worth = _calc_net_worth(db)

    existing = db.query(MonthSnapshot).filter(MonthSnapshot.month == month).first()
    if existing:
        existing.income = total_income
        existing.total_expenses = total_expenses
        existing.surplus = surplus
        existing.savings_rate = savings_rate
        existing.net_worth = net_worth
        db.commit()
        db.refresh(existing)
        return existing

    snap = MonthSnapshot(
        month=month,
        income=total_income,
        total_expenses=total_expenses,
        surplus=surplus,
        savings_rate=savings_rate,
        net_worth=net_worth,
    )
    db.add(snap)
    db.commit()
    db.refresh(snap)
    return snap


def delete_snapshot(db: Session, snap: MonthSnapshot) -> None:
    db.delete(snap)
    db.commit()


# ── Actual Spending ───────────────────────────────────────────────────────────

def get_actuals(db: Session, month: str) -> list[dict]:
    """Return per-category actuals for the month, filling budgeted from live items."""
    expense_items = get_expenses(db)
    budgeted_by_cat: dict[str, float] = {}
    for item in expense_items:
        budgeted_by_cat[item.category] = budgeted_by_cat.get(item.category, 0.0) + item.amount

    stored = {
        r.category: r
        for r in db.query(ActualSpending).filter(ActualSpending.month == month).all()
    }

    results = []
    for cat, budgeted in sorted(budgeted_by_cat.items()):
        row = stored.get(cat)
        results.append({
            "id": row.id if row else None,
            "month": month,
            "category": cat,
            "budgeted": row.budgeted if row else budgeted,
            "actual": row.actual if row else 0.0,
        })
    return results


def save_actuals(db: Session, batch: ActualSpendingBatch) -> list[ActualSpending]:
    results = []
    for item in batch.items:
        existing = (db.query(ActualSpending)
                      .filter(ActualSpending.month == batch.month,
                              ActualSpending.category == item.category)
                      .first())
        if existing:
            existing.budgeted = item.budgeted
            existing.actual = item.actual
            results.append(existing)
        else:
            row = ActualSpending(month=batch.month, category=item.category,
                                 budgeted=item.budgeted, actual=item.actual)
            db.add(row)
            results.append(row)
    db.commit()
    return results


# ── Debt Accounts ─────────────────────────────────────────────────────────────

def get_debts(db: Session) -> list[DebtAccount]:
    return db.query(DebtAccount).order_by(DebtAccount.created_at).all()


def create_debt(db: Session, data: DebtAccountCreate) -> DebtAccount:
    item = DebtAccount(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_debt(db: Session, item: DebtAccount, data: DebtAccountUpdate) -> DebtAccount:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_debt(db: Session, item: DebtAccount) -> None:
    db.delete(item)
    db.commit()


# ── Summary ───────────────────────────────────────────────────────────────────

def _calc_net_worth(db: Session) -> float:
    retirement_entries = get_retirement(db)
    latest: dict[str, float] = {}
    for e in retirement_entries:
        if e.account_name not in latest:
            latest[e.account_name] = e.balance
    assets = sum(latest.values())
    liabilities = sum(d.balance for d in db.query(DebtAccount).all())
    return assets - liabilities


def get_summary(db: Session) -> BudgetSummary:
    income_items = get_income(db)
    expense_items = get_expenses(db)

    total_income = sum(i.amount for i in income_items)
    total_expenses = sum(e.amount for e in expense_items)
    surplus = total_income - total_expenses
    savings_rate = (surplus / total_income) if total_income > 0 else 0.0

    expenses_by_category: dict[str, float] = {}
    for e in expense_items:
        expenses_by_category[e.category] = expenses_by_category.get(e.category, 0.0) + e.amount

    return BudgetSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        surplus=surplus,
        savings_rate=savings_rate,
        expenses_by_category=expenses_by_category,
        net_worth=_calc_net_worth(db),
    )
