export const SECTION_TITLES = {
  overview: "Visão geral",
  salesDaily: "Vendas por dia",
  deliveryPerformance: "Performance de entrega",
  sellerPerformance: "Performance dos vendedores",
  productPerformance: "Performance dos produtos",
  dataQualityCenter: "Central de qualidade dos dados",
} as const;

export const MART_TABLE_LABELS: Record<string, string> = {
  mart_sales_daily: "Vendas por dia",
  mart_delivery_performance: "Performance de entrega",
  mart_seller_performance: "Performance dos vendedores",
  mart_product_performance: "Performance dos produtos",
  mart_data_quality_summary: "Central de qualidade dos dados",
};

export const OVERVIEW_COLUMN_LABELS: Record<string, string> = {
  table_name: "Tabela",
  row_count: "Linhas",
};

export const SALES_DAILY_COLUMN_LABELS: Record<string, string> = {
  order_date: "Data",
  total_orders: "Total de pedidos",
  delivered_orders: "Pedidos entregues",
  canceled_orders: "Pedidos cancelados",
  total_revenue: "Receita total",
  total_freight: "Frete total",
  average_ticket: "Ticket médio",
  average_review_score: "Nota média",
};

export const DELIVERY_PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  customer_state: "Estado do cliente",
  total_orders: "Total de pedidos",
  delivered_orders: "Pedidos entregues",
  late_orders: "Pedidos atrasados",
  late_delivery_rate: "Taxa de atraso",
  avg_delivery_time_days: "Tempo médio (dias)",
  avg_delay_days: "Atraso médio (dias)",
};

export const SELLER_PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  seller_id: "Vendedor",
  seller_state: "Estado",
  total_orders: "Total de pedidos",
  total_items_sold: "Itens vendidos",
  total_revenue: "Receita total",
  total_freight: "Frete total",
  avg_item_price: "Preço médio",
  avg_review_score: "Nota média",
  late_delivery_rate: "Taxa de atraso",
};

export const PRODUCT_PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  product_category_name_english: "Categoria",
  total_orders: "Total de pedidos",
  total_items_sold: "Itens vendidos",
  total_revenue: "Receita total",
  avg_item_price: "Preço médio",
  avg_freight_value: "Frete médio",
  avg_review_score: "Nota média",
};

export const DATA_QUALITY_COLUMN_LABELS: Record<string, string> = {
  metric_name: "Métrica",
  metric_value: "Valor",
  checked_at: "Verificado em",
};

export const DATA_QUALITY_METRIC_LABELS: Record<string, string> = {
  total_orders: "Total de pedidos",
  orders_without_payment: "Pedidos sem pagamento",
  orders_without_items: "Pedidos sem itens",
  orders_without_review: "Pedidos sem avaliação",
  delivered_orders_with_late_delivery: "Pedidos entregues com atraso",
  canceled_orders: "Pedidos cancelados",
};

export function labelMartTable(value: string): string {
  return MART_TABLE_LABELS[value] ?? value;
}

export function labelDataQualityMetric(value: string): string {
  return DATA_QUALITY_METRIC_LABELS[value] ?? value;
}

export const HERO_BADGES = [
  "Python Pipeline",
  "PostgreSQL",
  "dbt Core",
  "Gold Layer",
  "FastAPI",
  "Next.js",
] as const;

export const EXECUTIVE_CARD_HELPERS = {
  total_orders: "Volume total de pedidos no período disponível.",
  total_revenue: "Receita bruta agregada (itens + frete).",
  average_ticket: "Receita total dividida pelo total de pedidos.",
  delivered_orders: "Pedidos entregues (status entregue).",
  canceled_orders: "Pedidos cancelados (status cancelado).",
  late_delivery_rate:
    "Proporção de entregas com atraso entre pedidos entregues.",
} as const;

