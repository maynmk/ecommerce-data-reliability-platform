import os
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[3]
ENV_PATH = ROOT_DIR / ".env"


def load_environment() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)
        return
    load_dotenv()


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

