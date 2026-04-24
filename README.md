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

Este repositorio contem apenas a estrutura inicial do projeto e a infraestrutura local minima para subir um banco PostgreSQL. Pipelines, API, dashboard e configuracoes de CI ainda nao foram implementados.

## Documentacao

- Arquitetura: [docs/architecture.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/architecture.md)
- Workflow Git: [docs/git_workflow.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/git_workflow.md)
- Execucao local: [docs/how_to_run.md](/e:/PORTFOLIO-DATA/ecommerce-data-reliability-platform/docs/how_to_run.md)

## Como iniciar

1. Copie `.env.example` para `.env`.
2. Suba o PostgreSQL com Docker Compose.
3. Consulte `docs/how_to_run.md` para os comandos de execucao.
