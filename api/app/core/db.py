from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from api.app.core.config import get_required_env


def build_engine() -> Engine:
    user = get_required_env("DATABASE_USER")
    password = get_required_env("DATABASE_PASSWORD")
    host = get_required_env("DATABASE_HOST")
    port = get_required_env("DATABASE_PORT")
    database = get_required_env("DATABASE_NAME")

    connection_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    return create_engine(connection_url, future=True, pool_pre_ping=True)

