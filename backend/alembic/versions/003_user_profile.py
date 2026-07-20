"""Add phone and location to users

Revision ID: 003_user_profile
Revises: 002_bookings
Create Date: 2026-07-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.migration_utils import has_column

revision: str = "003_user_profile"
down_revision: Union[str, None] = "002_bookings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if not has_column(bind, "users", "phone"):
        op.add_column("users", sa.Column("phone", sa.String(length=50), nullable=True))
    if not has_column(bind, "users", "location"):
        op.add_column("users", sa.Column("location", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "location")
    op.drop_column("users", "phone")
