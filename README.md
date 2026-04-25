# ecommerce-data-reliability-platform

Projeto base de Engenharia de Dados para simular uma plataforma de dados de e-commerce usando o dataset publico da Olist.

## Objetivo

Construir uma base profissional para ingestao, transformacao, disponibilizacao e observabilidade de dados de e-commerce, com foco em confiabilidade, rastreabilidade e documentacao tecnica.

## Stack proposta

- Python para pipelines de ingestao e processamento
- PostgreSQL via Docker Compose
- dbt Core para transformacoes analiticas
- FastAPI para futura camada de servico
- Next.js com TypeScript para futuro dashboard
- GitHub Actions para CI
- Documentacao tecnica em `docs/`

## Estrutura inicial

```text
ecommerce-data-reliability-platform/
├── data/
│   ├── raw/
│   ├── sample/
│   └── processed/
├── pipelines/
├── dbt/
├── api/
├── web/
├── docs/
├── tests/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── .env.example
├── requirements.txt
└── README.md
```

## Escopo atual

Este repositorio contem a infraestrutura local minima para PostgreSQL, um pipeline Python para carregar os CSVs brutos da Olist no schema `bronze` e a configuracao do dbt Core para gerar:

- modelos staging no schema `silver`
- modelos gold no schema `gold`

API e dashboard seguem fora do escopo atual.

## Documentacao

- Arquitetura: [docs/architecture.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/architecture.md)
- Workflow Git: [docs/git_workflow.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/git_workflow.md)
- Execucao local: [docs/how_to_run.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/how_to_run.md)

## Como iniciar

1. Copie `.env.example` para `.env`.
2. Suba o PostgreSQL com Docker Compose.
3. Instale as dependencias Python com `pip install -r requirements.txt`.
4. Execute a inicializacao do banco com `python pipelines/init_database.py`.
5. Execute a carga bronze com `python pipelines/load_bronze.py`.
6. Consulte `docs/how_to_run.md` para os comandos de execucao.

## dbt (staging/silver)

1. Copie `dbt/profiles.yml.example` para `dbt/profiles.yml` (este arquivo e ignorado pelo Git).
2. Rode os comandos a partir da pasta `dbt/`:

```bash
dbt debug --profiles-dir .
dbt run --profiles-dir .
dbt test --profiles-dir .
```

## dbt (gold)

Rode os modelos Gold (dim/fct/marts) a partir da pasta `dbt/`:

```bash
dbt run --profiles-dir . --select gold
dbt test --profiles-dir . --select gold
```

Se o comando `dbt` nao estiver no PATH do Windows, use:

```powershell
$DbtExe = (py -3.12 -c "import sys; from pathlib import Path; print(Path(sys.executable).parent / 'Scripts' / 'dbt.exe')")
& $DbtExe debug --project-dir dbt --profiles-dir dbt
& $DbtExe run --project-dir dbt --profiles-dir dbt
& $DbtExe test --project-dir dbt --profiles-dir dbt
```

Para rodar apenas Gold com esse mesmo atalho:

```powershell
& $DbtExe run --project-dir dbt --profiles-dir dbt --select gold
& $DbtExe test --project-dir dbt --profiles-dir dbt --select gold
```
