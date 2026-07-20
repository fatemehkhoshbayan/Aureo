"""Add email_notifications to users

Revision ID: 005_email_notifications
Revises: 004_user_avatar
Create Date: 2026-07-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.migration_utils import has_column

revision: str = "005_email_notifications"
down_revision: Union[str, None] = "004_user_avatar"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if not has_column(bind, "users", "email_notifications"):
        op.add_column(
            "users",
            sa.Column(
                "email_notifications",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("true"),
            ),
        )


def downgrade() -> None:
    op.drop_column("users", "email_notifications")
