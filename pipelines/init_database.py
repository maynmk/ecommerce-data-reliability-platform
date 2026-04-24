import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT_DIR / ".env"


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )


def load_environment() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)
        logging.info("Variaveis carregadas de %s", ENV_PATH)
        return

    load_dotenv()
    logging.warning("Arquivo .env nao encontrado em %s. Usando ambiente atual.", ENV_PATH)


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"Variavel obrigatoria ausente: {name}")
    return value


def build_engine() -> Engine:
    user = get_required_env("DATABASE_USER")
    password = get_required_env("DATABASE_PASSWORD")
    host = get_required_env("DATABASE_HOST")
    port = get_required_env("DATABASE_PORT")
    database = get_required_env("DATABASE_NAME")

    connection_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    logging.info("Conectando ao PostgreSQL em %s:%s/%s", host, port, database)
    return create_engine(connection_url, future=True)


def initialize_database(engine: Engine) -> None:
    schema_statements = [
        "CREATE SCHEMA IF NOT EXISTS bronze",
        "CREATE SCHEMA IF NOT EXISTS silver",
        "CREATE SCHEMA IF NOT EXISTS gold",
        "CREATE SCHEMA IF NOT EXISTS audit",
    ]

    create_table_statement = """
    CREATE TABLE IF NOT EXISTS audit.pipeline_runs (
        run_id UUID PRIMARY KEY,
        pipeline_name TEXT,
        source_name TEXT,
        started_at TIMESTAMP,
        finished_at TIMESTAMP,
        status TEXT,
        rows_loaded INTEGER,
        rows_failed INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """

    with engine.begin() as connection:
        for statement in schema_statements:
            logging.info("Executando: %s", statement)
            connection.execute(text(statement))

        logging.info("Criando tabela audit.pipeline_runs se necessario")
        connection.execute(text(create_table_statement))


def main() -> None:
    configure_logging()

    try:
        load_environment()
        engine = build_engine()

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            logging.info("Conexao com PostgreSQL validada com sucesso")

        initialize_database(engine)
        logging.info("Inicializacao do banco concluida com sucesso")
    except Exception as exc:
        logging.exception("Falha ao inicializar o banco: %s", exc)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
