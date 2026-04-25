from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from api.app.core.config import load_environment
from api.app.core.db import build_engine
from api.app.routers.health import router as health_router
from api.app.routers.metrics import router as metrics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_environment()
    app.state.engine = build_engine()
    try:
        yield
    finally:
        app.state.engine.dispose()


app = FastAPI(title="ecommerce-data-reliability-platform API", lifespan=lifespan)
app.include_router(health_router)
app.include_router(metrics_router)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
