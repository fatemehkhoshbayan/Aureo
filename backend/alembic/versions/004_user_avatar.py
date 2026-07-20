"""Add avatar to users

Revision ID: 004_user_avatar
Revises: 003_user_profile
Create Date: 2026-07-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.migration_utils import has_column

revision: str = "004_user_avatar"
down_revision: Union[str, None] = "003_user_profile"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if not has_column(bind, "users", "avatar"):
        op.add_column("users", sa.Column("avatar", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar")
