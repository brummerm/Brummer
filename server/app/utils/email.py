"""
Email notification utility for Home Tickets.

Reads SMTP configuration from environment variables:
  SMTP_HOST        SMTP server hostname       (e.g. smtp.gmail.com)
  SMTP_PORT        SMTP port                  (default: 587)
  SMTP_USER        Login username / sender    (e.g. you@gmail.com)
  SMTP_PASSWORD    Login password / app pwd
  SMTP_FROM        Display From address       (default: SMTP_USER)
  APP_BASE_URL     App URL for deep-links     (e.g. https://myapp.onrender.com)

If SMTP_HOST / SMTP_USER / SMTP_PASSWORD are not set, the function is a
no-op so the app works fine without email configured.
"""

import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

_PRIORITY_COLOR = {
    "urgent": "#ef4444",
    "high": "#f97316",
    "medium": "#3b82f6",
    "low": "#94a3b8",
}

_PRIORITY_LABEL = {
    "urgent": "🔴 Urgent",
    "high": "🟠 High",
    "medium": "🔵 Medium",
    "low": "⚪ Low",
}


def _build_html(
    ticket_title: str,
    ticket_id: int,
    priority: str,
    ticket_status: str,
    due_date: str | None,
    space_name: str,
    assignee_name: str,
    created_by_name: str,
    base_url: str,
) -> str:
    priority_color = _PRIORITY_COLOR.get(priority, "#94a3b8")
    priority_label = _PRIORITY_LABEL.get(priority, priority.capitalize())
    status_display = ticket_status.replace("_", " ").title()
    due_str = f"<tr><td style='padding:4px 0;color:#5e6c84;font-size:13px;'>Due date</td><td style='padding:4px 0 4px 16px;font-size:13px;color:#172b4d;font-weight:600;'>{due_date}</td></tr>" if due_date else ""

    link_section = ""
    if base_url:
        link_section = f"""
        <p style="margin:24px 0 0;">
          <a href="{base_url}/apps/tickets/"
             style="display:inline-block;padding:10px 20px;background:#0079bf;color:#fff;
                    text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
            Open ticket →
          </a>
        </p>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;
                    box-shadow:0 1px 4px rgba(0,0,0,.12);max-width:540px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0079bf;padding:20px 28px;">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">🏠 Home Tickets</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;">New card assigned to you</p>
          </td>
        </tr>

        <!-- Priority accent bar -->
        <tr><td style="height:4px;background:{priority_color};"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 28px 8px;">
            <p style="margin:0 0 4px;font-size:11px;color:#5e6c84;text-transform:uppercase;
                      letter-spacing:.05em;font-weight:600;">Board / Space</p>
            <p style="margin:0 0 16px;font-size:14px;color:#172b4d;">{space_name}</p>

            <h2 style="margin:0 0 20px;font-size:20px;color:#172b4d;font-weight:700;
                       line-height:1.3;">{ticket_title}</h2>

            <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #dfe1e6;
                                                           padding-top:16px;margin-top:0;">
              <tr>
                <td style="padding:4px 0;color:#5e6c84;font-size:13px;">Priority</td>
                <td style="padding:4px 0 4px 16px;">
                  <span style="display:inline-block;padding:2px 10px;border-radius:999px;
                               background:{priority_color}20;color:{priority_color};
                               font-size:12px;font-weight:600;">{priority_label}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#5e6c84;font-size:13px;">Status</td>
                <td style="padding:4px 0 4px 16px;font-size:13px;color:#172b4d;">{status_display}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#5e6c84;font-size:13px;">Assigned to</td>
                <td style="padding:4px 0 4px 16px;font-size:13px;color:#172b4d;font-weight:600;">{assignee_name}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#5e6c84;font-size:13px;">Created by</td>
                <td style="padding:4px 0 4px 16px;font-size:13px;color:#172b4d;">{created_by_name}</td>
              </tr>
              {due_str}
            </table>

            {link_section}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 28px;border-top:1px solid #dfe1e6;margin-top:24px;">
            <p style="margin:0;font-size:11px;color:#97a0af;">
              You're receiving this because notifications are enabled in Home Tickets settings.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_ticket_notification(
    *,
    to_emails: list[str],
    ticket_title: str,
    ticket_id: int,
    priority: str,
    ticket_status: str,
    due_date: str | None,
    space_name: str,
    assignee_name: str,
    created_by_name: str,
    member1_name: str,
    member2_name: str,
) -> None:
    """Send new-ticket notification emails. No-op if SMTP env vars are absent."""
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_host or not smtp_user or not smtp_password:
        logger.debug("Email notifications not configured — skipping.")
        return

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    from_addr = os.getenv("SMTP_FROM", smtp_user).strip()
    base_url = os.getenv("APP_BASE_URL", "").rstrip("/")

    subject = f"📋 New ticket assigned: {ticket_title}"
    html_body = _build_html(
        ticket_title=ticket_title,
        ticket_id=ticket_id,
        priority=priority,
        ticket_status=ticket_status,
        due_date=due_date,
        space_name=space_name,
        assignee_name=assignee_name,
        created_by_name=created_by_name,
        base_url=base_url,
    )
    text_body = (
        f"New ticket assigned to you: {ticket_title}\n\n"
        f"Space: {space_name}\n"
        f"Priority: {priority.capitalize()}\n"
        f"Status: {ticket_status.replace('_', ' ').title()}\n"
        + (f"Due: {due_date}\n" if due_date else "")
        + f"Assigned to: {assignee_name}\n"
        f"Created by: {created_by_name}\n"
        + (f"\nOpen app: {base_url}/apps/tickets/\n" if base_url else "")
    )

    for to_email in to_emails:
        if not to_email or "@" not in to_email:
            continue
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Home Tickets <{from_addr}>"
            msg["To"] = to_email
            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_addr, to_email, msg.as_string())

            logger.info(f"Notification email sent to {to_email} for ticket #{ticket_id}")
        except Exception as exc:
            logger.error(f"Failed to send notification email to {to_email}: {exc}")
