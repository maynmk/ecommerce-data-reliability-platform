# Arquitetura Inicial

## Visao geral

O projeto `ecommerce-data-reliability-platform` foi estruturado para simular uma plataforma moderna de dados de e-commerce baseada no dataset da Olist.

Nesta fase inicial, a arquitetura foi separada por responsabilidades para permitir evolucao incremental sem acoplamento desnecessario.

## Componentes

### `data/`

- `raw/`: armazenamento dos arquivos brutos de entrada
- `sample/`: subconjuntos menores para testes locais e validacoes rapidas
- `processed/`: artefatos gerados por pipelines futuras

### `pipelines/`

Diretorio reservado para scripts Python de ingestao, limpeza, carga e orquestracao local.

### `dbt/`

Diretorio reservado para o projeto dbt Core, incluindo modelos, seeds, tests e documentacao analitica.

### `api/`

Diretorio reservado para uma API em FastAPI que futuramente podera expor metricas, dados consolidados e endpoints operacionais.

### `web/`

Diretorio reservado para uma aplicacao Next.js com TypeScript destinada a dashboards e visualizacao.

### `tests/`

Espaco para testes automatizados das camadas Python e validacoes auxiliares.

### `.github/workflows/`

Diretorio reservado para pipelines de CI com GitHub Actions.

## Banco de dados local

O ambiente local utiliza PostgreSQL em container Docker para fornecer uma base relacional simples, reproduzivel e adequada para desenvolvimento e testes.

## Fluxo esperado no futuro

1. Dados brutos da Olist entram em `data/raw/`.
2. Pipelines Python realizam ingestao e padronizacao.
3. Dados sao carregados no PostgreSQL.
4. dbt aplica transformacoes e modelos analiticos.
5. FastAPI expoe informacoes processadas.
6. Next.js consome a API para visualizacao.

## Principio de confiabilidade

O desenho do projeto prioriza:

- separacao clara entre dados brutos e processados
- ambiente local reproduzivel
- transformacoes versionadas
- documentacao desde o inicio
- base preparada para testes e CI
