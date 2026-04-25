# API (FastAPI) — Camada Gold

## Objetivo

Esta API expõe métricas analíticas prontas para consumo (dashboards, análises e monitoramento) a partir da camada **Gold** do projeto `ecommerce-data-reliability-platform`.

## Fonte de dados (somente `gold`)

A API consulta **apenas** tabelas no schema PostgreSQL `gold` (marts/materializações do dbt).  
Ela **não** consulta diretamente `bronze`, `silver` ou `audit`.

## Endpoints disponíveis

### Saúde

- `GET /health`  
  Verifica se a API está no ar e se consegue conectar ao PostgreSQL.

### Métricas

- `GET /metrics/overview`  
  Visão geral rápida: contagem de linhas por mart, último dia disponível em `mart_sales_daily` e o último snapshot de métricas de qualidade (`mart_data_quality_summary`).

- `GET /metrics/sales-daily`  
  Série temporal diária de vendas (ex.: total de pedidos, receita, frete, ticket médio e review médio).

- `GET /metrics/delivery-performance`  
  Métricas de performance de entrega por UF do cliente (ex.: taxa de atraso, tempos médios).

- `GET /metrics/seller-performance`  
  Métricas de performance por vendedor (ex.: receita, itens vendidos, review médio, taxa de atraso).

- `GET /metrics/product-performance`  
  Métricas por categoria de produto (ex.: receita, itens vendidos, preço médio e review médio).

- `GET /metrics/data-quality`  
  Métricas de qualidade do dado calculadas a partir das fatos Gold (ex.: pedidos sem pagamento/itens/review, entregas atrasadas, cancelamentos).

## Como rodar localmente

Execute a partir da raiz do repositório (a API lê as variáveis de conexão do `.env`):

```bash
uvicorn api.app.main:app --reload --port 8000
```

## Swagger (OpenAPI)

Acesse a documentação interativa em:

```text
http://127.0.0.1:8000/docs
```

