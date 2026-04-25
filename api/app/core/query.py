from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError


def fetch_all(engine: Engine, sql: str, params: dict | None = None) -> list[dict]:
    statement = text(sql)
    try:
        with engine.connect() as connection:
            result = connection.execute(statement, params or {})
            return [dict(row) for row in result.mappings().all()]
    except SQLAlchemyError as exc:
        raise RuntimeError("Database query failed") from exc


def fetch_one(engine: Engine, sql: str, params: dict | None = None) -> dict | None:
    statement = text(sql)
    try:
        with engine.connect() as connection:
            result = connection.execute(statement, params or {})
            row = result.mappings().first()
            return dict(row) if row else None
    except SQLAlchemyError as exc:
        raise RuntimeError("Database query failed") from exc

