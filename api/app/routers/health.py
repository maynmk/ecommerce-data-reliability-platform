from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError


router = APIRouter(tags=["health"])


@router.get("/health")
def health(request: Request) -> dict:
    engine = request.app.state.engine
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

