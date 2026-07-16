"""empty message

Revision ID: 001_initial
Revises:
Create Date: 2026-07-15
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("image", sa.String(length=255), nullable=False),
        sa.Column("price_from", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "photographers",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("avatar", sa.String(length=255), nullable=False),
        sa.Column("cover", sa.String(length=255), nullable=False),
        sa.Column("specialties", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("bio", sa.Text(), nullable=False),
        sa.Column("experience", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("review_count", sa.Integer(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("starting_price", sa.Integer(), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "packages",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("photographer_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("duration", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("includes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["photographer_id"], ["photographers.id"]),
        sa.PrimaryKeyConstraint("id", "photographer_id"),
    )

    op.create_table(
        "portfolio_items",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("photographer_id", sa.String(length=50), nullable=False),
        sa.Column("image", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("alt", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["photographer_id"], ["photographers.id"]),
        sa.PrimaryKeyConstraint("id", "photographer_id"),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("photographer_id", sa.String(length=50), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=False),
        sa.Column("avatar", sa.String(length=255), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("date", sa.String(length=20), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("service", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["photographer_id"], ["photographers.id"]),
        sa.PrimaryKeyConstraint("id", "photographer_id"),
    )


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("portfolio_items")
    op.drop_table("packages")
    op.drop_table("photographers")
    op.drop_table("categories")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
