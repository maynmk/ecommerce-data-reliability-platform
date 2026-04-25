import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { Section } from "@/components/Section";
import { apiGet } from "@/lib/api";
import {
  formatCurrencyBRL,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
import type {
  DataQualityRow,
  DeliveryPerformanceRow,
  OverviewResponse,
  ProductPerformanceRow,
  SalesDailyRow,
  SellerPerformanceRow,
} from "@/lib/types";

function sum(rows: Array<Record<string, unknown>>, key: string): number {
  return rows.reduce((acc, row) => acc + (toNumber(row[key]) ?? 0), 0);
}

export default async function Home() {
  const [overview, salesDaily, delivery, sellers, products, dataQuality] =
    await Promise.all([
      apiGet<OverviewResponse>("/metrics/overview"),
      apiGet<SalesDailyRow[]>("/metrics/sales-daily?limit=1000"),
      apiGet<DeliveryPerformanceRow[]>("/metrics/delivery-performance?limit=1000"),
      apiGet<SellerPerformanceRow[]>("/metrics/seller-performance?limit=50"),
      apiGet<ProductPerformanceRow[]>("/metrics/product-performance?limit=50"),
      apiGet<DataQualityRow[]>("/metrics/data-quality?limit=200"),
    ]);

  const totalOrders = sum(salesDaily, "total_orders");
  const totalRevenue = sum(salesDaily, "total_revenue");
  const deliveredOrders = sum(salesDaily, "delivered_orders");
  const canceledOrders = sum(salesDaily, "canceled_orders");
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : null;

  const totalDelivered = sum(delivery, "delivered_orders");
  const totalLate = sum(delivery, "late_orders");
  const lateRate = totalDelivered > 0 ? totalLate / totalDelivered : null;

  const lastSalesDate =
    salesDaily.length > 0 ? (salesDaily[0]?.order_date ?? null) : null;
  const latestQualityCheckedAt =
    dataQuality.length > 0 ? (dataQuality[0]?.checked_at ?? null) : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            E-commerce Analytics Dashboard
          </h1>
          <p className="text-sm text-zinc-600">
            Métricas da camada Gold (dbt) consumidas via FastAPI.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <Section
          title="Overview"
          description={[
            lastSalesDate ? `Última data de vendas: ${formatDate(lastSalesDate)}.` : null,
            latestQualityCheckedAt
              ? `Último check de qualidade: ${formatDateTime(latestQualityCheckedAt)}.`
              : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard title="Total de pedidos" value={formatNumber(totalOrders)} />
            <MetricCard title="Receita total" value={formatCurrencyBRL(totalRevenue)} />
            <MetricCard
              title="Ticket médio"
              value={avgTicket === null ? "—" : formatCurrencyBRL(avgTicket)}
              subtitle="Receita total / total de pedidos"
            />
            <MetricCard
              title="Pedidos entregues"
              value={formatNumber(deliveredOrders)}
            />
            <MetricCard
              title="Pedidos cancelados"
              value={formatNumber(canceledOrders)}
            />
            <MetricCard
              title="Taxa de atraso"
              value={lateRate === null ? "—" : formatPercent(lateRate)}
              subtitle="Σ late_orders / Σ delivered_orders"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DataTable
              caption="Row count por mart (schema gold)"
              columns={[
                { key: "table_name", header: "Tabela" },
                {
                  key: "row_count",
                  header: "Linhas",
                  className: "text-right",
                  render: (r) => formatNumber(r.row_count),
                },
              ]}
              rows={overview.tables}
            />

            <DataTable
              caption="Data Quality Center (último snapshot)"
              columns={[
                { key: "metric_name", header: "Métrica" },
                {
                  key: "metric_value",
                  header: "Valor",
                  className: "text-right",
                  render: (r) => formatNumber(r.metric_value),
                },
                {
                  key: "checked_at",
                  header: "Checked at",
                  render: (r) => formatDateTime(r.checked_at),
                },
              ]}
              rows={overview.data_quality}
            />
          </div>
        </Section>

        <Section
          title="Sales Daily"
          description="Série diária de pedidos, receita, frete, ticket e score médio de review."
        >
          <DataTable
            columns={[
              { key: "order_date", header: "Data", render: (r) => formatDate(r.order_date) },
              {
                key: "total_orders",
                header: "Pedidos",
                className: "text-right",
                render: (r) => formatNumber(r.total_orders),
              },
              {
                key: "delivered_orders",
                header: "Entregues",
                className: "text-right",
                render: (r) => formatNumber(r.delivered_orders),
              },
              {
                key: "canceled_orders",
                header: "Cancelados",
                className: "text-right",
                render: (r) => formatNumber(r.canceled_orders),
              },
              {
                key: "total_revenue",
                header: "Receita",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.total_revenue),
              },
              {
                key: "average_ticket",
                header: "Ticket",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.average_ticket),
              },
              {
                key: "average_review_score",
                header: "Review",
                className: "text-right",
                render: (r) => (r.average_review_score == null ? "—" : Number(r.average_review_score).toFixed(2)),
              },
            ]}
            rows={salesDaily.slice(0, 30)}
            caption="Últimos 30 dias (use o endpoint para mais)."
          />
        </Section>

        <Section
          title="Delivery Performance"
          description="Performance de entrega por UF do cliente."
        >
          <DataTable
            columns={[
              { key: "customer_state", header: "UF" },
              {
                key: "total_orders",
                header: "Pedidos",
                className: "text-right",
                render: (r) => formatNumber(r.total_orders),
              },
              {
                key: "delivered_orders",
                header: "Entregues",
                className: "text-right",
                render: (r) => formatNumber(r.delivered_orders),
              },
              {
                key: "late_orders",
                header: "Atrasados",
                className: "text-right",
                render: (r) => formatNumber(r.late_orders),
              },
              {
                key: "late_delivery_rate",
                header: "Taxa atraso",
                className: "text-right",
                render: (r) => formatPercent(r.late_delivery_rate),
              },
              {
                key: "avg_delivery_time_days",
                header: "Avg dias",
                className: "text-right",
                render: (r) => (r.avg_delivery_time_days == null ? "—" : Number(r.avg_delivery_time_days).toFixed(2)),
              },
              {
                key: "avg_delay_days",
                header: "Avg delay",
                className: "text-right",
                render: (r) => (r.avg_delay_days == null ? "—" : Number(r.avg_delay_days).toFixed(2)),
              },
            ]}
            rows={delivery}
          />
        </Section>

        <Section
          title="Seller Performance"
          description="Top vendedores por receita (gold.mart_seller_performance)."
        >
          <DataTable
            columns={[
              { key: "seller_id", header: "Seller" },
              { key: "seller_state", header: "UF" },
              {
                key: "total_orders",
                header: "Pedidos",
                className: "text-right",
                render: (r) => formatNumber(r.total_orders),
              },
              {
                key: "total_revenue",
                header: "Receita",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.total_revenue),
              },
              {
                key: "avg_item_price",
                header: "Preço médio",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.avg_item_price),
              },
              {
                key: "avg_review_score",
                header: "Review",
                className: "text-right",
                render: (r) => (r.avg_review_score == null ? "—" : Number(r.avg_review_score).toFixed(2)),
              },
              {
                key: "late_delivery_rate",
                header: "Atraso",
                className: "text-right",
                render: (r) => formatPercent(r.late_delivery_rate),
              },
            ]}
            rows={sellers}
            caption="Top 50 por receita."
          />
        </Section>

        <Section
          title="Product Performance"
          description="Top categorias por receita (gold.mart_product_performance)."
        >
          <DataTable
            columns={[
              { key: "product_category_name_english", header: "Categoria" },
              {
                key: "total_orders",
                header: "Pedidos",
                className: "text-right",
                render: (r) => formatNumber(r.total_orders),
              },
              {
                key: "total_items_sold",
                header: "Itens",
                className: "text-right",
                render: (r) => formatNumber(r.total_items_sold),
              },
              {
                key: "total_revenue",
                header: "Receita",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.total_revenue),
              },
              {
                key: "avg_item_price",
                header: "Preço médio",
                className: "text-right",
                render: (r) => formatCurrencyBRL(r.avg_item_price),
              },
              {
                key: "avg_review_score",
                header: "Review",
                className: "text-right",
                render: (r) => (r.avg_review_score == null ? "—" : Number(r.avg_review_score).toFixed(2)),
              },
            ]}
            rows={products}
            caption="Top 50 por receita."
          />
        </Section>

        <Section
          title="Data Quality Center"
          description="Histórico recente de métricas de qualidade (gold.mart_data_quality_summary)."
        >
          <DataTable
            columns={[
              { key: "metric_name", header: "Métrica" },
              {
                key: "metric_value",
                header: "Valor",
                className: "text-right",
                render: (r) => formatNumber(r.metric_value),
              },
              {
                key: "checked_at",
                header: "Checked at",
                render: (r) => formatDateTime(r.checked_at),
              },
            ]}
            rows={dataQuality}
            caption="Últimas medições (limit=200)."
          />
        </Section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-zinc-500">
          Fonte: schema <span className="font-mono">gold</span> via FastAPI •
          Endpoints <span className="font-mono">/metrics/*</span>
        </div>
      </footer>
    </div>
  );
}
