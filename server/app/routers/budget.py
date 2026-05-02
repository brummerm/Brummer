from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..crud import budget as crud
from ..schemas.budget import (
    IncomeItemCreate, IncomeItemUpdate, IncomeItemOut,
    ExpenseItemCreate, ExpenseItemUpdate, ExpenseItemOut,
    SurplusAllocationUpdate, SurplusAllocationOut,
    RetirementEntryCreate, RetirementEntryOut,
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


@router.put("/allocations/{item_id}", response_model=SurplusAllocationOut)
def edit_allocation(item_id: int, data: SurplusAllocationUpdate, db: Session = Depends(get_db)):
    from ..models.budget import SurplusAllocation
    item = db.query(SurplusAllocation).filter(SurplusAllocation.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Surplus allocation not found")
    return crud.update_allocation(db, item, data)


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


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=BudgetSummary)
def get_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)
