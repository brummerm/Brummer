from sqlalchemy import Integer, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional


class Space(Base):
    __tablename__ = "ticket_spaces"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String, default="📋")
    color: Mapped[str] = mapped_column(String, default="#6366f1")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="space", cascade="all, delete")


class Label(Base):
    __tablename__ = "ticket_labels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, default="#64748b")
    ticket_labels: Mapped[list["TicketLabel"]] = relationship("TicketLabel", back_populates="label", cascade="all, delete")


class Ticket(Base):
    __tablename__ = "tickets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    space_id: Mapped[int] = mapped_column(Integer, ForeignKey("ticket_spaces.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="todo")  # backlog/todo/in_progress/waiting/done
    priority: Mapped[str] = mapped_column(String, default="medium")  # low/medium/high/urgent
    assignee: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # me/partner/null
    reporter: Mapped[str] = mapped_column(String, default="me")
    due_date: Mapped[Optional[object]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[object]] = mapped_column(DateTime(timezone=True), nullable=True)
    recurrence_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effort: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # small/medium/large
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    space: Mapped["Space"] = relationship("Space", back_populates="tickets")
    checklist: Mapped[list["ChecklistItem"]] = relationship(
        "ChecklistItem", back_populates="ticket", cascade="all, delete",
        order_by="ChecklistItem.sort_order"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="ticket", cascade="all, delete",
        order_by="Comment.created_at"
    )
    activity: Mapped[list["ActivityLog"]] = relationship(
        "ActivityLog", back_populates="ticket", cascade="all, delete",
        order_by="ActivityLog.created_at"
    )
    ticket_labels: Mapped[list["TicketLabel"]] = relationship(
        "TicketLabel", back_populates="ticket", cascade="all, delete"
    )


class ChecklistItem(Base):
    __tablename__ = "ticket_checklist"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="checklist")


class Comment(Base):
    __tablename__ = "ticket_comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), nullable=False)
    author: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="comments")


class ActivityLog(Base):
    __tablename__ = "ticket_activity"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), nullable=False)
    actor: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    field: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    old_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="activity")


class TicketLabel(Base):
    __tablename__ = "ticket_ticket_labels"
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), primary_key=True)
    label_id: Mapped[int] = mapped_column(Integer, ForeignKey("ticket_labels.id"), primary_key=True)
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="ticket_labels")
    label: Mapped["Label"] = relationship("Label", back_populates="ticket_labels")


class HouseholdSettings(Base):
    __tablename__ = "household_settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member1_name: Mapped[str] = mapped_column(String, default="Me")
    member2_name: Mapped[str] = mapped_column(String, default="Partner")


class SavedView(Base):
    __tablename__ = "ticket_saved_views"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    filters_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
