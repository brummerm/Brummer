from pydantic import BaseModel, ConfigDict, computed_field
from datetime import date as date_type, datetime
from typing import Optional, List


# ── Labels ────────────────────────────────────────────────────────────────────

class LabelOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    name: str
    color: str


class LabelCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str
    color: str = "#64748b"


# ── Spaces ────────────────────────────────────────────────────────────────────

class SpaceCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str
    description: Optional[str] = None
    icon: str = "📋"
    color: str = "#6366f1"
    sort_order: int = 0


class SpaceUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_archived: Optional[bool] = None
    sort_order: Optional[int] = None


class SpaceOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    icon: str
    color: str
    is_archived: bool
    is_completed_archive: bool = False
    sort_order: int
    ticket_count: int = 0
    created_at: datetime


# ── Checklist ─────────────────────────────────────────────────────────────────

class ChecklistItemCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    content: str
    sort_order: int = 0


class ChecklistItemUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    content: Optional[str] = None
    is_done: Optional[bool] = None
    sort_order: Optional[int] = None


class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    ticket_id: int
    content: str
    is_done: bool
    sort_order: int


# ── Comments ──────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    author: str = "me"
    content: str


class CommentOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    ticket_id: int
    author: str
    content: str
    created_at: datetime
    updated_at: datetime


# ── Activity ──────────────────────────────────────────────────────────────────

class ActivityLogOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    ticket_id: int
    actor: str
    action: str
    field: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime


# ── Tickets ───────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    space_id: int
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assignee: Optional[str] = None
    reporter: str = "me"
    due_date: Optional[date_type] = None
    recurrence_json: Optional[str] = None
    effort: Optional[str] = None
    label_ids: List[int] = []
    sort_order: int = 0


class TicketUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    space_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    due_date: Optional[date_type] = None
    recurrence_json: Optional[str] = None
    effort: Optional[str] = None
    label_ids: Optional[List[int]] = None
    sort_order: Optional[int] = None


class TicketOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    space_id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee: Optional[str] = None
    reporter: str
    due_date: Optional[date_type] = None
    completed_at: Optional[datetime] = None
    recurrence_json: Optional[str] = None
    effort: Optional[str] = None
    sort_order: int
    created_at: datetime
    updated_at: datetime
    checklist: List[ChecklistItemOut] = []
    comments: List[CommentOut] = []
    activity: List[ActivityLogOut] = []
    labels: List[LabelOut] = []


class TicketListItem(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    space_id: int
    title: str
    status: str
    priority: str
    assignee: Optional[str] = None
    due_date: Optional[date_type] = None
    recurrence_json: Optional[str] = None
    effort: Optional[str] = None
    labels: List[LabelOut] = []
    checklist_count: int = 0
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    model_config = ConfigDict(extra='ignore')
    due_today: List[TicketListItem] = []
    overdue: List[TicketListItem] = []
    my_tasks: List[TicketListItem] = []
    unassigned: List[TicketListItem] = []
    completed_this_week: int = 0


# ── Settings ──────────────────────────────────────────────────────────────────

class HouseholdSettingsOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    member1_name: str
    member2_name: str
    member1_email: Optional[str] = None
    member2_email: Optional[str] = None
    notifications_enabled: bool = True


class HouseholdSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    member1_name: Optional[str] = None
    member2_name: Optional[str] = None
    member1_email: Optional[str] = None
    member2_email: Optional[str] = None
    notifications_enabled: Optional[bool] = None


# ── Saved Views ───────────────────────────────────────────────────────────────

class SavedViewCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str
    filters_json: str


class SavedViewOut(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)
    id: int
    name: str
    filters_json: str
    created_at: datetime


# ── Reorder ───────────────────────────────────────────────────────────────────

class ReorderRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    ticket_ids: List[int]
