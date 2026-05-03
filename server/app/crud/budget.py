from __future__ import annotations
from datetime import date
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.budget import (
    IncomeItem, ExpenseItem, SurplusAllocation, RetirementEntry,
    MonthSnapshot, ActualSpending, DebtAccount, SavingsAccount,
)
from ..schemas.budget import (
    IncomeItemCreate, IncomeItemUpdate,
    ExpenseItemCreate, ExpenseItemUpdate,
    SurplusAllocationCreate, SurplusAllocationUpdate,
    RetirementEntryCreate,
    ActualSpendingBatch,
    SavingsAccountCreate, SavingsAccountUpdate,
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

    # Debt accounts are intentionally NOT seeded — $0 balance would overstate net worth.
    # Users enter their real balances via the Debt page.

    db.commit()


def migrate_data(db: Session) -> None:
    """Remove legacy Alyssa data and migrate old person-based expense categories."""
    changed = False

    # Remove Alyssa income items if any remain
    if db.query(IncomeItem).filter(IncomeItem.person == "alyssa").count() > 0:
        db.query(IncomeItem).filter(IncomeItem.person == "alyssa").delete()
        changed = True

    # Replace old category schema only if legacy categories are detected
    existing_cats = {r[0] for r in db.query(ExpenseItem.category).distinct()}
    if existing_cats & _OLD_CATEGORIES:
        db.query(ExpenseItem).delete()
        for category, label, amount, sort_order in _EXPENSE_SEED:
            db.add(ExpenseItem(category=category, label=label, amount=amount, sort_order=sort_order))
        changed = True

    if changed:
        db.commit()


# ── Income ────────────────────────────────────────────────────────────────────

def get_income(db: Session) -> list[IncomeItem]:
    return db.query(IncomeItem).order_by(IncomeItem.sort_order).all()


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


def _compute_snapshot_values(
    income_items: list[IncomeItem],
    expense_items: list[ExpenseItem],
    assets: float,
    liabilities: float,
) -> dict:
    total_income = sum(i.amount for i in income_items)
    total_expenses = sum(e.amount for e in expense_items)
    surplus = total_income - total_expenses
    # True savings rate: explicit savings contributions + any unspent surplus
    savings_direct = sum(e.amount for e in expense_items if e.category == "Savings")
    savings_rate = (savings_direct + max(0.0, surplus)) / total_income if total_income > 0 else 0.0
    return {
        "income": total_income,
        "total_expenses": total_expenses,
        "surplus": surplus,
        "savings_rate": savings_rate,
        "net_worth": assets - liabilities,
    }


def get_savings(db: Session) -> list[SavingsAccount]:
    return db.query(SavingsAccount).order_by(SavingsAccount.created_at).all()

def create_savings(db: Session, data: SavingsAccountCreate) -> SavingsAccount:
    item = SavingsAccount(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def update_savings(db: Session, item: SavingsAccount, data: SavingsAccountUpdate) -> SavingsAccount:
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

def delete_savings(db: Session, item: SavingsAccount) -> None:
    db.delete(item)
    db.commit()


def _get_net_worth_parts(db: Session) -> tuple[float, float]:
    """Return (assets, liabilities) without calling get_retirement to avoid an extra query."""
    entries = (db.query(RetirementEntry)
                 .order_by(RetirementEntry.recorded_date.desc(), RetirementEntry.account_name)
                 .all())
    latest: dict[str, float] = {}
    for e in entries:
        if e.account_name not in latest:
            latest[e.account_name] = e.balance
    retirement_assets = sum(latest.values())
    savings_assets = sum(s.balance for s in db.query(SavingsAccount).all())
    assets = retirement_assets + savings_assets
    liabilities = sum(d.balance for d in db.query(DebtAccount).all())
    return assets, liabilities


def save_snapshot(db: Session, month: str) -> MonthSnapshot:
    """Upsert the snapshot for the given month using live data."""
    income_items = get_income(db)
    expense_items = get_expenses(db)
    assets, liabilities = _get_net_worth_parts(db)
    vals = _compute_snapshot_values(income_items, expense_items, assets, liabilities)

    existing = db.query(MonthSnapshot).filter(MonthSnapshot.month == month).first()
    if existing:
        for k, v in vals.items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    snap = MonthSnapshot(month=month, **vals)
    db.add(snap)
    try:
        db.commit()
    except IntegrityError:
        # Race condition: another request inserted the same month between our SELECT and INSERT.
        db.rollback()
        existing = db.query(MonthSnapshot).filter(MonthSnapshot.month == month).first()
        if existing:
            for k, v in vals.items():
                setattr(existing, k, v)
            db.commit()
            db.refresh(existing)
            return existing
        raise
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
    # Single query to fetch all relevant existing rows (avoids N+1)
    categories = [item.category for item in batch.items]
    existing_map = {
        r.category: r
        for r in db.query(ActualSpending)
                    .filter(ActualSpending.month == batch.month,
                            ActualSpending.category.in_(categories))
                    .all()
    }

    results: list[ActualSpending] = []
    for item in batch.items:
        existing = existing_map.get(item.category)
        if existing:
            existing.budgeted = item.budgeted
            existing.actual = item.actual
            results.append(existing)
        else:
            row = ActualSpending(month=batch.month, category=item.category,
                                 budgeted=item.budgeted, actual=item.actual)
            db.add(row)
            results.append(row)

    try:
        db.commit()
    except IntegrityError:
        # Race condition on concurrent save for the same month+category.
        db.rollback()
        existing_map = {
            r.category: r
            for r in db.query(ActualSpending)
                        .filter(ActualSpending.month == batch.month,
                                ActualSpending.category.in_(categories))
                        .all()
        }
        results = []
        for item in batch.items:
            row = existing_map.get(item.category)
            if row:
                row.budgeted = item.budgeted
                row.actual = item.actual
                results.append(row)
        db.commit()

    # Refresh all rows (including newly created) so IDs are populated (B-02 fix)
    for row in results:
        db.refresh(row)
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

def get_summary(db: Session) -> BudgetSummary:
    income_items = get_income(db)
    expense_items = get_expenses(db)
    assets, liabilities = _get_net_worth_parts(db)

    total_income = sum(i.amount for i in income_items)
    total_expenses = sum(e.amount for e in expense_items)
    surplus = total_income - total_expenses
    savings_direct = sum(e.amount for e in expense_items if e.category == "Savings")
    savings_rate = (savings_direct + max(0.0, surplus)) / total_income if total_income > 0 else 0.0

    expenses_by_category: dict[str, float] = {}
    for e in expense_items:
        expenses_by_category[e.category] = expenses_by_category.get(e.category, 0.0) + e.amount

    return BudgetSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        surplus=surplus,
        savings_rate=savings_rate,
        expenses_by_category=expenses_by_category,
        net_worth=assets - liabilities,
    )
