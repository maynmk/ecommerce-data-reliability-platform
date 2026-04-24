import logging
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
import sys

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from init_database import (
    build_engine,
    configure_logging,
    initialize_database,
    load_environment,
)


ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = ROOT_DIR / "data" / "raw"
PIPELINE_NAME = "load_olist_bronze"


@dataclass
class PipelineRun:
    run_id: str
    started_at: datetime
    finished_at: datetime | None = None
    status: str = "running"
    rows_loaded: int = 0
    rows_failed: int = 0
    error_message: str | None = None


def normalize_identifier(value: str) -> str:
    normalized = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", value)
    normalized = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", normalized)
    normalized = re.sub(r"[^a-zA-Z0-9]+", "_", normalized)
    normalized = normalized.strip("_").lower()
    return normalized or "column"


def build_table_name(file_path: Path) -> str:
    name = normalize_identifier(file_path.stem)
    if name.startswith("olist_"):
        name = name.removeprefix("olist_")
    if name.endswith("_dataset"):
        name = name.removesuffix("_dataset")
    return name


def normalize_columns(columns: list[str]) -> list[str]:
    normalized = [normalize_identifier(column) for column in columns]
    duplicates: dict[str, int] = {}
    result: list[str] = []

    for column in normalized:
        count = duplicates.get(column, 0)
        duplicates[column] = count + 1
        result.append(column if count == 0 else f"{column}_{count + 1}")

    return result


def quote_identifier(value: str) -> str:
    return f'"{value}"'


def create_bronze_table(engine: Engine, table_name: str, columns: list[str]) -> None:
    quoted_table_name = quote_identifier(table_name)
    source_columns = ",\n            ".join(
        f"{quote_identifier(column)} TEXT" for column in columns
    )
    create_statement = f"""
    CREATE TABLE bronze.{quoted_table_name} (
            {source_columns},
            "ingestion_run_id" TEXT,
            "source_file" TEXT,
            "ingested_at" TIMESTAMPTZ
    )
    """

    with engine.begin() as connection:
        connection.execute(text(f"DROP TABLE IF EXISTS bronze.{quoted_table_name}"))

    with engine.begin() as connection:
        connection.execute(text(create_statement))


def discover_csv_files(raw_dir: Path) -> list[Path]:
    files = sorted(raw_dir.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"Nenhum arquivo CSV encontrado em {raw_dir}")
    return files


def insert_pipeline_run(engine: Engine, run: PipelineRun) -> None:
    statement = text(
        """
        INSERT INTO audit.pipeline_runs (
            run_id,
            pipeline_name,
            source_name,
            started_at,
            finished_at,
            status,
            rows_loaded,
            rows_failed,
            error_message
        ) VALUES (
            :run_id,
            :pipeline_name,
            :source_name,
            :started_at,
            :finished_at,
            :status,
            :rows_loaded,
            :rows_failed,
            :error_message
        )
        """
    )

    with engine.begin() as connection:
        connection.execute(
            statement,
            {
                "run_id": run.run_id,
                "pipeline_name": PIPELINE_NAME,
                "source_name": str(RAW_DATA_DIR),
                "started_at": run.started_at,
                "finished_at": run.finished_at,
                "status": run.status,
                "rows_loaded": run.rows_loaded,
                "rows_failed": run.rows_failed,
                "error_message": run.error_message,
            },
        )


def update_pipeline_run(engine: Engine, run: PipelineRun) -> None:
    statement = text(
        """
        UPDATE audit.pipeline_runs
        SET
            finished_at = :finished_at,
            status = :status,
            rows_loaded = :rows_loaded,
            rows_failed = :rows_failed,
            error_message = :error_message
        WHERE run_id = :run_id
        """
    )

    with engine.begin() as connection:
        connection.execute(
            statement,
            {
                "run_id": run.run_id,
                "finished_at": run.finished_at,
                "status": run.status,
                "rows_loaded": run.rows_loaded,
                "rows_failed": run.rows_failed,
                "error_message": run.error_message,
            },
        )


def load_csv_to_bronze(engine: Engine, file_path: Path, run_id: str) -> int:
    table_name = build_table_name(file_path)
    logging.info("Lendo arquivo %s", file_path.name)
    dataframe = pd.read_csv(file_path, dtype=str, low_memory=False)
    dataframe.columns = normalize_columns(dataframe.columns.tolist())
    dataframe["ingestion_run_id"] = run_id
    dataframe["source_file"] = file_path.name
    dataframe["ingested_at"] = datetime.now(timezone.utc).isoformat()

    row_count = len(dataframe.index)
    logging.info(
        "Carregando %s linhas em bronze.%s",
        row_count,
        table_name,
    )

    create_bronze_table(engine, table_name, dataframe.columns[:-3].tolist())

    csv_buffer = StringIO()
    dataframe.to_csv(csv_buffer, index=False, header=False)
    csv_buffer.seek(0)

    quoted_table_name = quote_identifier(table_name)
    quoted_columns = ", ".join(quote_identifier(column) for column in dataframe.columns)
    copy_statement = (
        f"COPY bronze.{quoted_table_name} ({quoted_columns}) "
        "FROM STDIN WITH (FORMAT CSV)"
    )

    raw_connection = engine.raw_connection()
    try:
        with raw_connection.cursor() as cursor:
            cursor.copy_expert(copy_statement, csv_buffer)
        raw_connection.commit()
    except Exception:
        raw_connection.rollback()
        raise
    finally:
        raw_connection.close()

    logging.info("Carga concluida para bronze.%s", table_name)
    return row_count


def run_pipeline(engine: Engine) -> PipelineRun:
    run = PipelineRun(
        run_id=str(uuid.uuid4()),
        started_at=datetime.now(timezone.utc),
    )

    insert_pipeline_run(engine, run)
    files = discover_csv_files(RAW_DATA_DIR)
    logging.info("Encontrados %s arquivos CSV em %s", len(files), RAW_DATA_DIR)

    try:
        for file_path in files:
            rows_loaded = load_csv_to_bronze(engine, file_path, run.run_id)
            run.rows_loaded += rows_loaded

        run.status = "success"
        return run
    except Exception as exc:
        failed_rows = 0
        if "file_path" in locals() and file_path.exists():
            with file_path.open("rb") as csv_file:
                failed_rows = sum(1 for _ in csv_file) - 1

        run.status = "failed"
        run.rows_failed += max(failed_rows, 0)
        run.error_message = f"{type(exc).__name__}: {exc}"
        logging.error("Falha durante a carga bronze no arquivo %s", file_path.name)
        raise
    finally:
        run.finished_at = datetime.now(timezone.utc)
        update_pipeline_run(engine, run)


def main() -> None:
    configure_logging()

    try:
        load_environment()
        engine = build_engine()

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            logging.info("Conexao com PostgreSQL validada com sucesso")

        initialize_database(engine)
        run = run_pipeline(engine)
        logging.info(
            "Pipeline %s finalizado com status=%s, rows_loaded=%s, rows_failed=%s, run_id=%s",
            PIPELINE_NAME,
            run.status,
            run.rows_loaded,
            run.rows_failed,
            run.run_id,
        )
    except Exception as exc:
        logging.exception("Falha na execucao do pipeline bronze: %s", exc)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
