"""Add favorites table

Revision ID: 007_favorites
Revises: 006_booking_contact_email
Create Date: 2026-07-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007_favorites"
down_revision: Union[str, None] = "006_booking_contact_email"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "favorites",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("photographer_id", sa.String(length=50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["photographer_id"], ["photographers.id"]),
        sa.PrimaryKeyConstraint("user_id", "photographer_id"),
    )


def downgrade() -> None:
    op.drop_table("favorites")
