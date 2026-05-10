from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.tickets import (
    Space, Label, Ticket, ChecklistItem, Comment, SavedView,
)
from ..schemas.tickets import (
    SpaceCreate, SpaceUpdate, SpaceOut,
    LabelOut, LabelCreate,
    TicketCreate, TicketUpdate, TicketOut, TicketListItem,
    ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemOut,
    CommentCreate, CommentOut,
    DashboardStats,
    HouseholdSettingsOut, HouseholdSettingsUpdate,
    SavedViewCreate, SavedViewOut,
    ReorderRequest,
)
from .. import crud

router = APIRouter(tags=["tickets"])


# ── Dependency helpers ────────────────────────────────────────────────────────

def get_space_or_404(space_id: int, db: Session = Depends(get_db)) -> Space:
    space = crud.tickets.get_space(db, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


def get_ticket_or_404(ticket_id: int, db: Session = Depends(get_db)) -> Ticket:
    ticket = crud.tickets.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


def get_label_or_404(label_id: int, db: Session = Depends(get_db)) -> Label:
    label = db.query(Label).filter(Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


def _ticket_to_list_item(ticket: Ticket) -> dict:
    """Add computed fields for TicketListItem serialisation."""
    return {
        "id": ticket.id,
        "space_id": ticket.space_id,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "assignee": ticket.assignee,
        "due_date": ticket.due_date,
        "recurrence_json": ticket.recurrence_json,
        "effort": ticket.effort,
        "labels": [tl.label for tl in ticket.ticket_labels if tl.label],
        "checklist_count": len(ticket.checklist),
        "comment_count": len(ticket.comments),
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


# ── Spaces ────────────────────────────────────────────────────────────────────

@router.get("/spaces", response_model=list[SpaceOut])
def list_spaces(
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
):
    return crud.tickets.get_spaces(db, include_archived=include_archived)


@router.post("/spaces", response_model=SpaceOut, status_code=status.HTTP_201_CREATED)
def create_space(data: SpaceCreate, db: Session = Depends(get_db)):
    return crud.tickets.create_space(db, data)


@router.get("/spaces/{space_id}", response_model=SpaceOut)
def get_space(space_id: int, db: Session = Depends(get_db)):
    return get_space_or_404(space_id, db)


@router.patch("/spaces/{space_id}", response_model=SpaceOut)
def update_space(
    data: SpaceUpdate,
    space: Space = Depends(get_space_or_404),
    db: Session = Depends(get_db),
):
    return crud.tickets.update_space(db, space, data)


@router.delete("/spaces/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(
    space: Space = Depends(get_space_or_404),
    db: Session = Depends(get_db),
):
    crud.tickets.delete_space(db, space)


# ── Tickets ───────────────────────────────────────────────────────────────────

@router.get("/tickets", response_model=list[TicketListItem])
def list_tickets(
    space_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    assignee: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    include_done: bool = Query(True),
    db: Session = Depends(get_db),
):
    tickets = crud.tickets.get_tickets(
        db,
        space_id=space_id,
        status=status_filter,
        assignee=assignee,
        priority=priority,
        search=search,
        include_done=include_done,
    )
    items = [TicketListItem.model_validate(_ticket_to_list_item(t)) for t in tickets]
    return items


@router.post("/tickets", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    data: TicketCreate,
    actor: str = Query("me"),
    db: Session = Depends(get_db),
):
    ticket = crud.tickets.create_ticket(db, data, actor=actor)
    return _hydrate_ticket_out(ticket)


@router.get("/tickets/reorder", include_in_schema=False)
def _reorder_placeholder():
    # Exists only to prevent /tickets/{id} from swallowing POST /tickets/reorder
    pass


@router.post("/tickets/reorder")
def reorder_tickets(data: ReorderRequest, db: Session = Depends(get_db)):
    crud.tickets.reorder_tickets(db, data.ticket_ids)
    return {"ok": True}


@router.get("/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return _hydrate_ticket_out(get_ticket_or_404(ticket_id, db))


@router.patch("/tickets/{ticket_id}", response_model=TicketOut)
def update_ticket(
    data: TicketUpdate,
    actor: str = Query("me"),
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
):
    updated = crud.tickets.update_ticket(db, ticket, data, actor=actor)
    return _hydrate_ticket_out(updated)


@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
):
    crud.tickets.delete_ticket(db, ticket)


@router.post("/tickets/{ticket_id}/complete", response_model=TicketOut)
def complete_ticket(
    actor: str = Query("me"),
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
):
    completed = crud.tickets.complete_ticket(db, ticket, actor=actor)
    return _hydrate_ticket_out(completed)


# ── Checklist ─────────────────────────────────────────────────────────────────

@router.get("/tickets/{ticket_id}/checklist", response_model=list[ChecklistItemOut])
def list_checklist(
    ticket: Ticket = Depends(get_ticket_or_404),
):
    return ticket.checklist


@router.post(
    "/tickets/{ticket_id}/checklist",
    response_model=ChecklistItemOut,
    status_code=status.HTTP_201_CREATED,
)
def add_checklist_item(
    data: ChecklistItemCreate,
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
):
    return crud.tickets.add_checklist_item(
        db, ticket.id, data.content, sort_order=data.sort_order
    )


@router.patch("/tickets/{ticket_id}/checklist/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(
    ticket_id: int,
    item_id: int,
    data: ChecklistItemUpdate,
    db: Session = Depends(get_db),
):
    item = db.query(ChecklistItem).filter(
        ChecklistItem.id == item_id,
        ChecklistItem.ticket_id == ticket_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    return crud.tickets.update_checklist_item(
        db, item,
        content=data.content,
        is_done=data.is_done,
        sort_order=data.sort_order,
    )


@router.delete(
    "/tickets/{ticket_id}/checklist/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_checklist_item(
    ticket_id: int,
    item_id: int,
    db: Session = Depends(get_db),
):
    item = db.query(ChecklistItem).filter(
        ChecklistItem.id == item_id,
        ChecklistItem.ticket_id == ticket_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    crud.tickets.delete_checklist_item(db, item)


# ── Comments ──────────────────────────────────────────────────────────────────

@router.get("/tickets/{ticket_id}/comments", response_model=list[CommentOut])
def list_comments(ticket: Ticket = Depends(get_ticket_or_404)):
    return ticket.comments


@router.post(
    "/tickets/{ticket_id}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    data: CommentCreate,
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
):
    return crud.tickets.add_comment(db, ticket.id, data.author, data.content)


@router.delete(
    "/tickets/{ticket_id}/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    ticket_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
):
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.ticket_id == ticket_id,
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    crud.tickets.delete_comment(db, comment)


# ── Labels ────────────────────────────────────────────────────────────────────

@router.get("/labels", response_model=list[LabelOut])
def list_labels(db: Session = Depends(get_db)):
    return crud.tickets.get_labels(db)


@router.post("/labels", response_model=LabelOut, status_code=status.HTTP_201_CREATED)
def create_label(data: LabelCreate, db: Session = Depends(get_db)):
    return crud.tickets.create_label(db, data.name, data.color)


@router.delete("/labels/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label: Label = Depends(get_label_or_404),
    db: Session = Depends(get_db),
):
    crud.tickets.delete_label(db, label)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    member: str = Query("me"),
    db: Session = Depends(get_db),
):
    raw = crud.tickets.get_dashboard_stats(db, member=member)
    return DashboardStats(
        due_today=[TicketListItem.model_validate(_ticket_to_list_item(t)) for t in raw["due_today"]],
        overdue=[TicketListItem.model_validate(_ticket_to_list_item(t)) for t in raw["overdue"]],
        my_tasks=[TicketListItem.model_validate(_ticket_to_list_item(t)) for t in raw["my_tasks"]],
        unassigned=[TicketListItem.model_validate(_ticket_to_list_item(t)) for t in raw["unassigned"]],
        completed_this_week=raw["completed_this_week"],
    )


# ── Settings ──────────────────────────────────────────────────────────────────

@router.get("/settings", response_model=HouseholdSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return crud.tickets.get_settings(db)


@router.patch("/settings", response_model=HouseholdSettingsOut)
def update_settings(data: HouseholdSettingsUpdate, db: Session = Depends(get_db)):
    settings = crud.tickets.get_settings(db)
    return crud.tickets.update_settings(db, settings, data)


# ── Saved Views ───────────────────────────────────────────────────────────────

@router.get("/saved-views", response_model=list[SavedViewOut])
def list_saved_views(db: Session = Depends(get_db)):
    return crud.tickets.get_saved_views(db)


@router.post("/saved-views", response_model=SavedViewOut, status_code=status.HTTP_201_CREATED)
def create_saved_view(data: SavedViewCreate, db: Session = Depends(get_db)):
    return crud.tickets.create_saved_view(db, data.name, data.filters_json)


@router.delete("/saved-views/{view_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_view(view_id: int, db: Session = Depends(get_db)):
    view = db.query(SavedView).filter(SavedView.id == view_id).first()
    if not view:
        raise HTTPException(status_code=404, detail="Saved view not found")
    crud.tickets.delete_saved_view(db, view)


# ── Internal helper ───────────────────────────────────────────────────────────

def _hydrate_ticket_out(ticket: Ticket) -> TicketOut:
    """Convert a Ticket ORM object to TicketOut, resolving labels from the join table."""
    labels = [tl.label for tl in ticket.ticket_labels if tl.label]
    data = TicketOut.model_validate(ticket)
    data.labels = [LabelOut.model_validate(l) for l in labels]
    return data
