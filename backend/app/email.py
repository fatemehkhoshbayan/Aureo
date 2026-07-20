"""Transactional email helpers for booking confirmations and cancellations."""

from __future__ import annotations

import logging
import smtplib
from datetime import datetime
from email.message import EmailMessage

from app.config import get_settings

logger = logging.getLogger(__name__)


def _format_when(scheduled_at: datetime) -> str:
    return scheduled_at.strftime("%b %d, %Y · %I:%M %p %Z").strip()


def _format_price(price: int) -> str:
    return f"${price:,}"


def send_email(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = to
    message.set_content(body)

    if not settings.smtp_host:
        # Dev fallback: make booking emails visible in docker/uvicorn logs.
        print(
            f"\n----- Aureo email (SMTP not configured) -----\n"
            f"To: {to}\nSubject: {subject}\n\n{body}"
            f"----------------------------------------------\n",
            flush=True,
        )
        return

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            if settings.smtp_tls:
                smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
        logger.info("Sent email to %s (%s)", to, subject)
    except Exception:
        logger.exception("Failed to send email to %s (%s)", to, subject)


def send_booking_confirmed_email(
    *,
    to: str,
    user_name: str,
    photographer_name: str,
    package_name: str,
    scheduled_at: datetime,
    price: int,
    booking_id: str,
) -> None:
    when = _format_when(scheduled_at)
    subject = f"Aureo booking confirmed — {package_name}"
    body = (
        f"Hi {user_name},\n\n"
        f"Your booking is confirmed.\n\n"
        f"Photographer: {photographer_name}\n"
        f"Package: {package_name}\n"
        f"When: {when}\n"
        f"Total: {_format_price(price)}\n"
        f"Reference: AUR-{booking_id.upper()}\n\n"
        f"You can review it anytime under My Bookings.\n\n"
        f"— Aureo\n"
    )
    send_email(to, subject, body)


def send_booking_cancelled_email(
    *,
    to: str,
    user_name: str,
    photographer_name: str,
    package_name: str,
    scheduled_at: datetime,
    price: int,
    booking_id: str,
) -> None:
    when = _format_when(scheduled_at)
    subject = f"Aureo booking cancelled — {package_name}"
    body = (
        f"Hi {user_name},\n\n"
        f"Your booking has been cancelled.\n\n"
        f"Photographer: {photographer_name}\n"
        f"Package: {package_name}\n"
        f"When: {when}\n"
        f"Total: {_format_price(price)}\n"
        f"Reference: AUR-{booking_id.upper()}\n\n"
        f"If this was a mistake, you can book again from the photographer's profile.\n\n"
        f"— Aureo\n"
    )
    send_email(to, subject, body)
