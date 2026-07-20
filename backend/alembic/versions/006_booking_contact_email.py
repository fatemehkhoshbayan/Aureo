"""Add contact_email to bookings

Revision ID: 006_booking_contact_email
Revises: 005_email_notifications
Create Date: 2026-07-19
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.migration_utils import has_column

revision: str = "006_booking_contact_email"
down_revision: Union[str, None] = "005_email_notifications"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if not has_column(bind, "bookings", "contact_email"):
        op.add_column("bookings", sa.Column("contact_email", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "contact_email")
