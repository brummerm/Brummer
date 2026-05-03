from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..crud import budget as crud
from ..schemas.budget import (
    IncomeItemCreate, IncomeItemUpdate, IncomeItemOut,
    ExpenseItemCreate, ExpenseItemUpdate, ExpenseItemOut,
    SurplusAllocationCreate, SurplusAllocationUpdate, SurplusAllocationOut,
    RetirementEntryCreate, RetirementEntryOut,
    MonthSnapshotOut,
    ActualSpendingBatch,
    DebtAccountCreate, DebtAccountUpdate, DebtAccountOut,
    BudgetSummary,
)

router = APIRouter(tags=["budget"])


# ── Income ────────────────────────────────────────────────────────────────────

@router.get("/income", response_model=list[IncomeItemOut])
def list_income(db: Session = Depends(get_db)):
    return crud.get_income(db)


@router.post("/income", response_model=IncomeItemOut, status_code=201)
def add_income(data: IncomeItemCreate, db: Session = Depends(get_db)):
    return crud.create_income(db, data)


@router.put("/income/{item_id}", response_model=IncomeItemOut)
def edit_income(item_id: int, data: IncomeItemUpdate, db: Session = Depends(get_db)):
    from ..models.budget import IncomeItem
    item = db.query(IncomeItem).filter(IncomeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Income item not found")
    return crud.update_income(db, item, data)


@router.delete("/income/{item_id}", status_code=204)
def remove_income(item_id: int, db: Session = Depends(get_db)):
    from ..models.budget import IncomeItem
    item = db.query(IncomeItem).filter(IncomeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Income item not found")
    crud.delete_income(db, item)
    return Response(status_code=204)


# ── Expenses ──────────────────────────────────────────────────────────────────

@router.get("/expenses", response_model=list[ExpenseItemOut])
def list_expenses(db: Session = Depends(get_db)):
    return crud.get_expenses(db)


@router.post("/expenses", response_model=ExpenseItemOut, status_code=201)
def add_expense(data: ExpenseItemCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db, data)


@router.put("/expenses/{item_id}", response_model=ExpenseItemOut)
def edit_expense(item_id: int, data: ExpenseItemUpdate, db: Session = Depends(get_db)):
    from ..models.budget import ExpenseItem
    item = db.query(ExpenseItem).filter(ExpenseItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Expense item not found")
    return crud.update_expense(db, item, data)


@router.delete("/expenses/{item_id}", status_code=204)
def remove_expense(item_id: int, db: Session = Depends(get_db)):
    from ..models.budget import ExpenseItem
    item = db.query(ExpenseItem).filter(ExpenseItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Expense item not found")
    crud.delete_expense(db, item)
    return Response(status_code=204)


# ── Surplus Allocations ───────────────────────────────────────────────────────

@router.get("/allocations", response_model=list[SurplusAllocationOut])
def list_allocations(db: Session = Depends(get_db)):
    return crud.get_allocations(db)


@router.post("/allocations", response_model=SurplusAllocationOut, status_code=201)
def add_allocation(data: SurplusAllocationCreate, db: Session = Depends(get_db)):
    return crud.create_allocation(db, data)


@router.put("/allocations/{item_id}", response_model=SurplusAllocationOut)
def edit_allocation(item_id: int, data: SurplusAllocationUpdate, db: Session = Depends(get_db)):
    from ..models.budget import SurplusAllocation
    item = db.query(SurplusAllocation).filter(SurplusAllocation.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Surplus allocation not found")
    return crud.update_allocation(db, item, data)


@router.delete("/allocations/{item_id}", status_code=204)
def remove_allocation(item_id: int, db: Session = Depends(get_db)):
    from ..models.budget import SurplusAllocation
    item = db.query(SurplusAllocation).filter(SurplusAllocation.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Surplus allocation not found")
    crud.delete_allocation(db, item)
    return Response(status_code=204)


# ── Retirement ────────────────────────────────────────────────────────────────

@router.get("/retirement", response_model=list[RetirementEntryOut])
def list_retirement(db: Session = Depends(get_db)):
    return crud.get_retirement(db)


@router.post("/retirement", response_model=RetirementEntryOut, status_code=201)
def add_retirement(data: RetirementEntryCreate, db: Session = Depends(get_db)):
    return crud.create_retirement(db, data)


@router.delete("/retirement/{entry_id}", status_code=204)
def remove_retirement(entry_id: int, db: Session = Depends(get_db)):
    from ..models.budget import RetirementEntry
    entry = db.query(RetirementEntry).filter(RetirementEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Retirement entry not found")
    crud.delete_retirement(db, entry)
    return Response(status_code=204)


# ── Month Snapshots ───────────────────────────────────────────────────────────

@router.get("/snapshots", response_model=list[MonthSnapshotOut])
def list_snapshots(db: Session = Depends(get_db)):
    return crud.get_snapshots(db)


@router.post("/snapshots/{month}", response_model=MonthSnapshotOut, status_code=201)
def save_snapshot(month: str, db: Session = Depends(get_db)):
    return crud.save_snapshot(db, month)


@router.delete("/snapshots/{snap_id}", status_code=204)
def remove_snapshot(snap_id: int, db: Session = Depends(get_db)):
    from ..models.budget import MonthSnapshot
    snap = db.query(MonthSnapshot).filter(MonthSnapshot.id == snap_id).first()
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    crud.delete_snapshot(db, snap)
    return Response(status_code=204)


# ── Actual Spending ───────────────────────────────────────────────────────────

@router.get("/actuals/{month}")
def get_actuals(month: str, db: Session = Depends(get_db)):
    return crud.get_actuals(db, month)


@router.post("/actuals", status_code=200)
def save_actuals(batch: ActualSpendingBatch, db: Session = Depends(get_db)):
    crud.save_actuals(db, batch)
    return {"ok": True}


# ── Debt Accounts ─────────────────────────────────────────────────────────────

@router.get("/debt", response_model=list[DebtAccountOut])
def list_debts(db: Session = Depends(get_db)):
    return crud.get_debts(db)


@router.post("/debt", response_model=DebtAccountOut, status_code=201)
def add_debt(data: DebtAccountCreate, db: Session = Depends(get_db)):
    return crud.create_debt(db, data)


@router.put("/debt/{item_id}", response_model=DebtAccountOut)
def edit_debt(item_id: int, data: DebtAccountUpdate, db: Session = Depends(get_db)):
    from ..models.budget import DebtAccount
    item = db.query(DebtAccount).filter(DebtAccount.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Debt account not found")
    return crud.update_debt(db, item, data)


@router.delete("/debt/{item_id}", status_code=204)
def remove_debt(item_id: int, db: Session = Depends(get_db)):
    from ..models.budget import DebtAccount
    item = db.query(DebtAccount).filter(DebtAccount.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Debt account not found")
    crud.delete_debt(db, item)
    return Response(status_code=204)


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=BudgetSummary)
def get_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)
