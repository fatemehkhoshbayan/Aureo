"""Idempotency helpers for Alembic migrations.

Some environments (notably a database that previously had its schema
created via SQLAlchemy's ``Base.metadata.create_all()`` before Alembic
tracked a version) may already have tables/columns/indexes that a
migration is about to create. Every migration's ``upgrade()`` should use
these helpers to check before creating, so that ``alembic upgrade head``
is always safe to (re)run against any database state.
"""

from sqlalchemy import inspect
from sqlalchemy.engine import Connection


def has_table(bind: Connection, table_name: str) -> bool:
    return inspect(bind).has_table(table_name)


def has_column(bind: Connection, table_name: str, column_name: str) -> bool:
    if not has_table(bind, table_name):
        return False
    return column_name in {c["name"] for c in inspect(bind).get_columns(table_name)}


def has_index(bind: Connection, table_name: str, index_name: str) -> bool:
    if not has_table(bind, table_name):
        return False
    return index_name in {i["name"] for i in inspect(bind).get_indexes(table_name)}
