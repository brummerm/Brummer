import json
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..models.tickets import (
    Space, Label, Ticket, ChecklistItem, Comment,
    ActivityLog, TicketLabel, HouseholdSettings, SavedView,
)
from ..schemas.tickets import (
    SpaceCreate, SpaceUpdate,
    TicketCreate, TicketUpdate,
    ChecklistItemUpdate,
    HouseholdSettingsUpdate,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ticket_joinedload():
    """Standard joinedload options for a fully-hydrated Ticket."""
    return [
        joinedload(Ticket.checklist),
        joinedload(Ticket.comments),
        joinedload(Ticket.activity),
        joinedload(Ticket.ticket_labels).joinedload(TicketLabel.label),
        joinedload(Ticket.space),
    ]


def _ticket_list_joinedload():
    """Lightweight joinedload for list views."""
    return [
        joinedload(Ticket.ticket_labels).joinedload(TicketLabel.label),
        joinedload(Ticket.checklist),
        joinedload(Ticket.comments),
    ]


def _build_ticket_list_item(ticket: Ticket) -> dict:
    """Build the extra computed fields for TicketListItem."""
    return {
        "labels": [tl.label for tl in ticket.ticket_labels if tl.label],
        "checklist_count": len(ticket.checklist),
        "comment_count": len(ticket.comments),
    }


def _sync_labels(db: Session, ticket: Ticket, label_ids: list[int]) -> None:
    """Replace the ticket's label associations with the given list."""
    db.query(TicketLabel).filter(TicketLabel.ticket_id == ticket.id).delete()
    for lid in label_ids:
        db.add(TicketLabel(ticket_id=ticket.id, label_id=lid))


def _log(db: Session, ticket_id: int, actor: str, action: str,
         field: str = None, old_value: str = None, new_value: str = None) -> None:
    db.add(ActivityLog(
        ticket_id=ticket_id,
        actor=actor,
        action=action,
        field=field,
        old_value=old_value,
        new_value=new_value,
    ))


# ── Spaces ────────────────────────────────────────────────────────────────────

def get_spaces(db: Session, include_archived: bool = False) -> list[Space]:
    q = db.query(Space)
    if not include_archived:
        q = q.filter(Space.is_archived == False)
    spaces = q.order_by(Space.sort_order, Space.name).all()
    # Attach ticket_count as a transient attribute
    for space in spaces:
        count = (db.query(func.count(Ticket.id))
                 .filter(Ticket.space_id == space.id)
                 .scalar()) or 0
        space.ticket_count = count
    return spaces


def get_space(db: Session, space_id: int) -> Optional[Space]:
    space = db.query(Space).filter(Space.id == space_id).first()
    if space:
        count = (db.query(func.count(Ticket.id))
                 .filter(Ticket.space_id == space.id)
                 .scalar()) or 0
        space.ticket_count = count
    return space


def create_space(db: Session, data: SpaceCreate) -> Space:
    space = Space(
        name=data.name,
        description=data.description,
        icon=data.icon,
        color=data.color,
        sort_order=data.sort_order,
    )
    db.add(space)
    db.commit()
    db.refresh(space)
    space.ticket_count = 0
    return space


def update_space(db: Session, space: Space, data: SpaceUpdate) -> Space:
    if data.name is not None:
        space.name = data.name
    if data.description is not None:
        space.description = data.description
    if data.icon is not None:
        space.icon = data.icon
    if data.color is not None:
        space.color = data.color
    if data.is_archived is not None:
        space.is_archived = data.is_archived
    if data.sort_order is not None:
        space.sort_order = data.sort_order
    db.commit()
    db.refresh(space)
    count = (db.query(func.count(Ticket.id))
             .filter(Ticket.space_id == space.id)
             .scalar()) or 0
    space.ticket_count = count
    return space


def delete_space(db: Session, space: Space) -> None:
    db.delete(space)
    db.commit()


# ── Labels ────────────────────────────────────────────────────────────────────

def get_labels(db: Session) -> list[Label]:
    return db.query(Label).order_by(Label.name).all()


def create_label(db: Session, name: str, color: str = "#64748b") -> Label:
    label = Label(name=name, color=color)
    db.add(label)
    db.commit()
    db.refresh(label)
    return label


def delete_label(db: Session, label: Label) -> None:
    db.delete(label)
    db.commit()


# ── Tickets ───────────────────────────────────────────────────────────────────

def get_tickets(
    db: Session,
    space_id: Optional[int] = None,
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    due_before: Optional[date] = None,
    include_done: bool = True,
) -> list[Ticket]:
    q = (db.query(Ticket)
         .options(*_ticket_list_joinedload()))

    if space_id is not None:
        q = q.filter(Ticket.space_id == space_id)
    if status is not None:
        q = q.filter(Ticket.status == status)
    if assignee is not None:
        if assignee == "unassigned":
            q = q.filter(Ticket.assignee.is_(None))
        else:
            q = q.filter(Ticket.assignee == assignee)
    if priority is not None:
        q = q.filter(Ticket.priority == priority)
    if search:
        pattern = f"%{search}%"
        q = q.filter(
            Ticket.title.ilike(pattern) | Ticket.description.ilike(pattern)
        )
    if due_before is not None:
        q = q.filter(Ticket.due_date <= due_before)
    if not include_done:
        q = q.filter(Ticket.status != "done")

    return q.order_by(Ticket.sort_order, Ticket.created_at).all()


def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    return (db.query(Ticket)
            .options(*_ticket_joinedload())
            .filter(Ticket.id == ticket_id)
            .first())


def create_ticket(db: Session, data: TicketCreate, actor: str = "me") -> Ticket:
    ticket = Ticket(
        space_id=data.space_id,
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        assignee=data.assignee,
        reporter=data.reporter,
        due_date=data.due_date,
        recurrence_json=data.recurrence_json,
        effort=data.effort,
        sort_order=data.sort_order,
    )
    db.add(ticket)
    db.flush()

    # Sync labels
    if data.label_ids:
        _sync_labels(db, ticket, data.label_ids)

    # Activity log
    _log(db, ticket.id, actor, "created")

    db.commit()
    return get_ticket(db, ticket.id)


def update_ticket(db: Session, ticket: Ticket, data: TicketUpdate, actor: str = "me") -> Ticket:
    tracked_fields = ["space_id", "title", "description", "status", "priority",
                      "assignee", "reporter", "due_date", "recurrence_json", "effort", "sort_order"]

    for field in tracked_fields:
        new_val = getattr(data, field, None)
        if new_val is None:
            continue
        old_val = getattr(ticket, field)
        if old_val != new_val:
            _log(db, ticket.id, actor, "updated",
                 field=field,
                 old_value=str(old_val) if old_val is not None else None,
                 new_value=str(new_val))
            setattr(ticket, field, new_val)

    # Handle label_ids separately (not a model column)
    if data.label_ids is not None:
        _sync_labels(db, ticket, data.label_ids)

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_ticket(db, ticket.id)


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()


def complete_ticket(db: Session, ticket: Ticket, actor: str = "me") -> Ticket:
    old_status = ticket.status
    ticket.status = "done"
    ticket.completed_at = datetime.now(timezone.utc)
    ticket.updated_at = datetime.now(timezone.utc)

    _log(db, ticket.id, actor, "updated",
         field="status",
         old_value=old_status,
         new_value="done")

    # Handle recurrence: create next ticket instance
    if ticket.recurrence_json:
        rule = json.loads(ticket.recurrence_json)
        freq = rule.get("frequency", "weekly")
        interval = rule.get("interval", 1)
        base = ticket.due_date or date.today()

        if freq == "daily":
            next_due = base + timedelta(days=interval)
        elif freq == "weekly":
            next_due = base + timedelta(weeks=interval)
        elif freq == "monthly":
            month = base.month - 1 + interval
            year = base.year + month // 12
            month = month % 12 + 1
            next_due = base.replace(year=year, month=month)
        elif freq == "yearly":
            next_due = base.replace(year=base.year + interval)
        else:
            next_due = base + timedelta(days=interval * 30)

        new_ticket = Ticket(
            space_id=ticket.space_id,
            title=ticket.title,
            description=ticket.description,
            status="todo",
            priority=ticket.priority,
            assignee=ticket.assignee,
            reporter=ticket.reporter,
            due_date=next_due,
            recurrence_json=ticket.recurrence_json,
            effort=ticket.effort,
        )
        db.add(new_ticket)

    db.commit()
    return get_ticket(db, ticket.id)


def reorder_tickets(db: Session, ticket_ids: list[int]) -> None:
    for i, tid in enumerate(ticket_ids):
        db.query(Ticket).filter(Ticket.id == tid).update({"sort_order": i})
    db.commit()


# ── Checklist ─────────────────────────────────────────────────────────────────

def add_checklist_item(db: Session, ticket_id: int, content: str, sort_order: int = 0) -> ChecklistItem:
    item = ChecklistItem(ticket_id=ticket_id, content=content, sort_order=sort_order)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_checklist_item(
    db: Session,
    item: ChecklistItem,
    content: Optional[str] = None,
    is_done: Optional[bool] = None,
    sort_order: Optional[int] = None,
) -> ChecklistItem:
    if content is not None:
        item.content = content
    if is_done is not None:
        item.is_done = is_done
    if sort_order is not None:
        item.sort_order = sort_order
    db.commit()
    db.refresh(item)
    return item


def delete_checklist_item(db: Session, item: ChecklistItem) -> None:
    db.delete(item)
    db.commit()


# ── Comments ──────────────────────────────────────────────────────────────────

def add_comment(db: Session, ticket_id: int, author: str, content: str) -> Comment:
    comment = Comment(ticket_id=ticket_id, author=author, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()


# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard_stats(db: Session, member: str = "me") -> dict:
    today = date.today()
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    done_statuses = {"done"}
    inactive_statuses = {"done", "backlog"}

    base_opts = _ticket_list_joinedload()

    # Due today: due_date == today, not done
    due_today = (db.query(Ticket)
                 .options(*base_opts)
                 .filter(Ticket.due_date == today,
                         ~Ticket.status.in_(done_statuses))
                 .order_by(Ticket.priority, Ticket.sort_order)
                 .all())

    # Overdue: due_date < today, not done
    overdue = (db.query(Ticket)
               .options(*base_opts)
               .filter(Ticket.due_date < today,
                       ~Ticket.status.in_(done_statuses))
               .order_by(Ticket.due_date, Ticket.sort_order)
               .all())

    # My tasks: assigned to member, active
    my_tasks = (db.query(Ticket)
                .options(*base_opts)
                .filter(Ticket.assignee == member,
                        ~Ticket.status.in_(inactive_statuses))
                .order_by(Ticket.priority, Ticket.due_date, Ticket.sort_order)
                .all())

    # Unassigned: no assignee, active
    unassigned = (db.query(Ticket)
                  .options(*base_opts)
                  .filter(Ticket.assignee.is_(None),
                          ~Ticket.status.in_(inactive_statuses))
                  .order_by(Ticket.priority, Ticket.sort_order)
                  .all())

    # Completed this week: completed_at >= 7 days ago
    completed_this_week = (db.query(func.count(Ticket.id))
                           .filter(Ticket.completed_at >= week_ago)
                           .scalar()) or 0

    return {
        "due_today": due_today,
        "overdue": overdue,
        "my_tasks": my_tasks,
        "unassigned": unassigned,
        "completed_this_week": completed_this_week,
    }


# ── Settings ──────────────────────────────────────────────────────────────────

def get_settings(db: Session) -> HouseholdSettings:
    settings = db.query(HouseholdSettings).first()
    if not settings:
        settings = HouseholdSettings(member1_name="Me", member2_name="Partner")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, settings: HouseholdSettings, data: HouseholdSettingsUpdate) -> HouseholdSettings:
    if data.member1_name is not None:
        settings.member1_name = data.member1_name
    if data.member2_name is not None:
        settings.member2_name = data.member2_name
    db.commit()
    db.refresh(settings)
    return settings


# ── Saved Views ───────────────────────────────────────────────────────────────

def get_saved_views(db: Session) -> list[SavedView]:
    return db.query(SavedView).order_by(SavedView.name).all()


def create_saved_view(db: Session, name: str, filters_json: str) -> SavedView:
    view = SavedView(name=name, filters_json=filters_json)
    db.add(view)
    db.commit()
    db.refresh(view)
    return view


def delete_saved_view(db: Session, view: SavedView) -> None:
    db.delete(view)
    db.commit()


# ── Seed Defaults ─────────────────────────────────────────────────────────────

def seed_defaults(db: Session) -> None:
    from datetime import timedelta

    # Create default settings if not exists
    if not db.query(HouseholdSettings).first():
        db.add(HouseholdSettings(member1_name="Matt", member2_name="Partner"))
        db.flush()

    # Create default spaces if none exist
    if db.query(Space).count() == 0:
        default_spaces = [
            Space(name="Home", icon="🏠", color="#6366f1", sort_order=0),
            Space(name="Errands", icon="🚗", color="#f59e0b", sort_order=1),
            Space(name="Shopping", icon="🛒", color="#10b981", sort_order=2),
            Space(name="Bills & Finances", icon="💰", color="#3b82f6", sort_order=3),
            Space(name="Repairs", icon="🔧", color="#ef4444", sort_order=4),
            Space(name="Trips & Events", icon="✈️", color="#8b5cf6", sort_order=5),
            Space(name="Someday / Backlog", icon="📅", color="#64748b", sort_order=6),
        ]
        for s in default_spaces:
            db.add(s)
        db.flush()

    # Create default labels if none exist
    if db.query(Label).count() == 0:
        default_labels = [
            Label(name="urgent", color="#ef4444"),
            Label(name="grocery", color="#10b981"),
            Label(name="health", color="#3b82f6"),
            Label(name="car", color="#f59e0b"),
            Label(name="finance", color="#6366f1"),
            Label(name="cleaning", color="#8b5cf6"),
            Label(name="home-repair", color="#ef4444"),
        ]
        for l in default_labels:
            db.add(l)
        db.flush()

    # Seed sample tickets if none exist
    if db.query(Ticket).count() == 0:
        spaces = {s.name: s for s in db.query(Space).all()}
        today = date.today()

        sample_tickets = [
            Ticket(space_id=spaces["Shopping"].id, title="Buy groceries for taco night",
                   status="todo", priority="medium", assignee="me",
                   description="Need: ground beef, taco shells, cheese, salsa, sour cream, lettuce"),
            Ticket(space_id=spaces["Home"].id, title="Schedule dentist appointment",
                   status="todo", priority="high", assignee="me",
                   due_date=today + timedelta(days=7)),
            Ticket(space_id=spaces["Repairs"].id, title="Call plumber about sink leak",
                   status="in_progress", priority="urgent", assignee="partner",
                   description="Kitchen sink has been dripping for 2 weeks. Get 2-3 quotes."),
            Ticket(space_id=spaces["Errands"].id, title="Renew car registration",
                   status="todo", priority="high", assignee="me",
                   due_date=today + timedelta(days=14)),
            Ticket(space_id=spaces["Trips & Events"].id, title="Pack for beach trip",
                   status="backlog", priority="medium", assignee=None),
            Ticket(space_id=spaces["Home"].id, title="Deep clean kitchen",
                   status="todo", priority="medium", assignee="partner",
                   recurrence_json='{"frequency":"monthly","interval":1}'),
            Ticket(space_id=spaces["Bills & Finances"].id, title="Pay electric bill",
                   status="todo", priority="high", assignee="me",
                   due_date=today + timedelta(days=5),
                   recurrence_json='{"frequency":"monthly","interval":1}'),
            Ticket(space_id=spaces["Home"].id, title="Replace smoke detector batteries",
                   status="backlog", priority="low", assignee=None,
                   recurrence_json='{"frequency":"yearly","interval":1}'),
            Ticket(space_id=spaces["Home"].id, title="Take out trash",
                   status="todo", priority="medium", assignee="me",
                   due_date=today + timedelta(days=2),
                   recurrence_json='{"frequency":"weekly","interval":1}'),
            Ticket(space_id=spaces["Errands"].id, title="Pick up dry cleaning",
                   status="waiting", priority="low", assignee="partner"),
        ]
        for t in sample_tickets:
            db.add(t)

    db.commit()
