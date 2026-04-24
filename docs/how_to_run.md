# Como rodar localmente

## Pre-requisitos

- Docker Desktop ou Docker Engine com Docker Compose
- Python 3.11+ instalado localmente

## 1. Configurar variaveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, voce tambem pode usar:

```powershell
Copy-Item .env.example .env
```

## 2. Subir o PostgreSQL

Execute na raiz do projeto:

```bash
docker compose up -d
```

Para verificar se o container esta ativo:

```bash
docker compose ps
```

Para acompanhar logs:

```bash
docker compose logs -f postgres
```

## 3. Parar o ambiente

```bash
docker compose down
```

Se quiser remover tambem o volume persistido do banco:

```bash
docker compose down -v
```

## 4. Inicializar schemas e auditoria

```bash
python pipelines/init_database.py
```

## 5. Carregar os CSVs brutos no schema bronze

```bash
python pipelines/load_bronze.py
```

O pipeline:

- le todos os CSVs de `data/raw`
- cria ou substitui uma tabela em `bronze` para cada arquivo
- padroniza nomes de tabelas e colunas
- adiciona colunas tecnicas de ingestao
- registra a execucao em `audit.pipeline_runs`

## Conexao esperada

- Host: `localhost`
- Porta: valor definido em `POSTGRES_PORT`
- Database: valor definido em `POSTGRES_DB`
- Usuario: valor definido em `POSTGRES_USER`
- Senha: valor definido em `POSTGRES_PASSWORD`

## Observacao

Nesta etapa, o projeto sobe apenas o PostgreSQL. As camadas de pipeline, API, dbt e frontend ainda nao foram implementadas.
