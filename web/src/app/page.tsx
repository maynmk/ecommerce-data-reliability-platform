import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { ExecutiveCard } from "@/components/ExecutiveCard";
import { InsightCard } from "@/components/InsightCard";
import { OptionPills } from "@/components/OptionPills";
import { QualityList } from "@/components/QualityList";
import { Section } from "@/components/Section";
import { Shell } from "@/components/Shell";
import { StatusCard } from "@/components/StatusCard";
import { StepFlow } from "@/components/StepFlow";
import { ChartCard } from "@/components/charts/ChartCard";
import { DeliveryStateBarChart } from "@/components/charts/DeliveryStateBarChart";
import { ProductCategoryBarChart } from "@/components/charts/ProductCategoryBarChart";
import { SalesDailyLineChart } from "@/components/charts/SalesDailyLineChart";
import { SellerRevenueBarChart } from "@/components/charts/SellerRevenueBarChart";
import { apiGet } from "@/lib/api";
import {
  DATA_QUALITY_COLUMN_LABELS,
  DATA_QUALITY_METRIC_LABELS,
  DELIVERY_PERFORMANCE_COLUMN_LABELS,
  EXECUTIVE_CARD_HELPERS,
  HERO_BADGES,
  MART_TABLE_LABELS,
  OVERVIEW_COLUMN_LABELS,
  PRODUCT_PERFORMANCE_COLUMN_LABELS,
  SALES_DAILY_COLUMN_LABELS,
  SECTION_TITLES,
  SELLER_PERFORMANCE_COLUMN_LABELS,
} from "@/lib/labels";
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

function truncateId(value: unknown): string {
  const text = String(value ?? "");
  if (text.length <= 14) return text;
  return `${text.slice(0, 8)}…${text.slice(-4)}`;
}

type Status = "OK" | "Atenção" | "Crítico";

function classifyReliability(value: number, totalOrders: number | null): Status {
  if (value === 0) return "OK";
  if (!totalOrders || totalOrders <= 0) return value < 10 ? "Atenção" : "Crítico";

  const ratio = value / totalOrders;
  if (ratio >= 0.05) return "Crítico";
  if (ratio >= 0.01) return "Atenção";
  return "Atenção";
}

function badgeForRate(
  rate: number | null,
): { label: string; tone: "neutral" | "warning" | "danger" } | null {
  if (rate == null) return null;
  if (rate >= 0.08) return { label: "Crítico", tone: "danger" };
  if (rate >= 0.03) return { label: "Atenção", tone: "warning" };
  return { label: "OK", tone: "neutral" };
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

  const snapshot = overview.data_quality;
  const totalOrdersSnapshot = snapshot.find((m) => m.metric_name === "total_orders");
  const totalOrdersValue = totalOrdersSnapshot
    ? toNumber(totalOrdersSnapshot.metric_value)
    : null;

  const reliabilityKeys = [
    "orders_without_payment",
    "orders_without_items",
    "orders_without_review",
    "delivered_orders_with_late_delivery",
    "canceled_orders",
  ] as const;

  const reliabilityMetrics = reliabilityKeys
    .map((key) => ({
      key,
      label: DATA_QUALITY_METRIC_LABELS[key] ?? key,
      value:
        toNumber(snapshot.find((m) => m.metric_name === key)?.metric_value) ?? 0,
    }))
    .map((m) => ({
      ...m,
      status: classifyReliability(m.value, totalOrdersValue),
    }));

  const totalQualityIssues = reliabilityMetrics.reduce((acc, m) => acc + m.value, 0);
  const lateBadge = badgeForRate(lateRate);

  const sellersSorted = [...sellers].sort(
    (a, b) => (toNumber(b.total_revenue) ?? 0) - (toNumber(a.total_revenue) ?? 0),
  );

  const sellerStateCounters = new Map<string, number>();
  const sellerAliases = new Map<
    string,
    { alias: string; seller_id_trunc: string; seller_state: string }
  >();

  for (const row of sellersSorted) {
    const state = String(row.seller_state ?? "NA");
    const count = (sellerStateCounters.get(state) ?? 0) + 1;
    sellerStateCounters.set(state, count);

    const alias = `Vendedor ${state} #${String(count).padStart(3, "0")}`;
    sellerAliases.set(String(row.seller_id), {
      alias,
      seller_id_trunc: truncateId(row.seller_id),
      seller_state: state,
    });
  }

  const sellersTop10 = sellersSorted.slice(0, 10);
  const sellerChartData = sellersTop10.map((row) => {
    const meta = sellerAliases.get(String(row.seller_id));
    return {
      seller_label: meta?.alias ?? "Vendedor #???",
      seller_id_trunc: meta?.seller_id_trunc ?? truncateId(row.seller_id),
      total_revenue: toNumber(row.total_revenue) ?? 0,
    };
  });

  const topLateState = [...delivery]
    .map((r) => ({
      state: r.customer_state,
      rate: toNumber(r.late_delivery_rate) ?? 0,
    }))
    .sort((a, b) => b.rate - a.rate)[0];

  const topCategory = [...products]
    .map((r) => ({
      category: String(r.product_category_name_english ?? "unknown"),
      revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)[0];

  const topSeller = [...sellers]
    .map((r) => ({
      seller_id: r.seller_id,
      revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <Shell
      title={
        <span>
          Central de Performance e Confiabilidade do{" "}
          <span className="text-emerald-300">E-commerce</span>
        </span>
      }
      subtitle="Monitore receita, pedidos, entregas, vendedores, produtos e qualidade dos dados em uma visão executiva alimentada por camadas Bronze, Silver e Gold."
      badges={HERO_BADGES}
      nav={[
        { id: "overview", label: "Overview Comercial" },
        { id: "qualidade", label: "Qualidade dos Dados" },
        { id: "vendas", label: "Vendas" },
        { id: "entregas", label: "Entregas" },
        { id: "vendedores", label: "Vendedores" },
        { id: "produtos", label: "Produtos" },
      ]}
      top={
        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/25 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
                Command center
              </div>
              <div className="text-sm text-zinc-300">
                {lastSalesDate
                  ? `Última data de vendas: ${formatDate(lastSalesDate)}.`
                  : null}{" "}
                {latestQualityCheckedAt
                  ? `Último check de qualidade: ${formatDateTime(latestQualityCheckedAt)}.`
                  : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:hidden">
              {HERO_BADGES.slice(0, 6).map((b) => (
                <Badge key={b}>{b}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <ExecutiveCard
              title="Total de pedidos"
              value={formatNumber(totalOrders)}
              description={EXECUTIVE_CARD_HELPERS.total_orders}
            />
            <ExecutiveCard
              title="Receita total"
              value={formatCurrencyBRL(totalRevenue)}
              description={EXECUTIVE_CARD_HELPERS.total_revenue}
            />
            <ExecutiveCard
              title="Ticket médio"
              value={avgTicket === null ? "—" : formatCurrencyBRL(avgTicket)}
              description={EXECUTIVE_CARD_HELPERS.average_ticket}
            />
            <ExecutiveCard
              title="Pedidos entregues"
              value={formatNumber(deliveredOrders)}
              description={EXECUTIVE_CARD_HELPERS.delivered_orders}
              statusLabel="Operação"
              statusTone="neutral"
            />
            <ExecutiveCard
              title="Pedidos cancelados"
              value={formatNumber(canceledOrders)}
              description={EXECUTIVE_CARD_HELPERS.canceled_orders}
              statusLabel={canceledOrders === 0 ? "OK" : "Atenção"}
              statusTone={canceledOrders === 0 ? "success" : "warning"}
            />
            <ExecutiveCard
              title="Taxa de atraso"
              value={lateRate === null ? "—" : formatPercent(lateRate)}
              description={EXECUTIVE_CARD_HELPERS.late_delivery_rate}
              statusLabel={lateBadge?.label}
              statusTone={lateBadge?.tone ?? "neutral"}
            />
          </div>
        </div>
      }
      panels={[
        {
          id: "overview",
          content: (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <ChartCard
                    title="Receita por mês"
                    subtitle="Agregado no frontend a partir dos dados diários (últimos 12 meses)."
                  >
                    <SalesDailyLineChart rows={salesDaily} limit={12} />
                  </ChartCard>
                </div>
                <div className="grid gap-4 lg:col-span-4">
                  <ChartCard
                    title="Performance por Estado"
                    subtitle="Top 10 estados por taxa de atraso."
                  >
                    <DeliveryStateBarChart rows={delivery} limit={10} />
                  </ChartCard>
                  <OptionPills
                    title="KPIs Operacionais"
                    options={[
                      "Receita",
                      "Pedidos",
                      "Ticket médio",
                      "Entregas",
                      "Atrasos",
                      "Qualidade dos dados",
                    ]}
                    activeIndex={0}
                  />
                </div>
              </div>

              <Section title="Insights executivos" description="Destaques no topo do funil de análise.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InsightCard
                    title="Maior taxa de atraso"
                    value={
                      topLateState
                        ? `${topLateState.state} • ${formatPercent(topLateState.rate)}`
                        : "—"
                    }
                    description="Estado com maior risco de atraso."
                  />
                  <InsightCard
                    title="Categoria com maior receita"
                    value={topCategory ? topCategory.category : "—"}
                    description={topCategory ? formatCurrencyBRL(topCategory.revenue) : "—"}
                  />
                  <InsightCard
                    title="Vendedor com maior receita"
                    value={
                      topSeller
                        ? sellerAliases.get(String(topSeller.seller_id))?.alias ?? "—"
                        : "—"
                    }
                    description={topSeller ? formatCurrencyBRL(topSeller.revenue) : "—"}
                    badge={
                      topSeller
                        ? {
                            label:
                              sellerAliases.get(String(topSeller.seller_id))
                                ?.seller_state ?? "—",
                            tone: "neutral",
                          }
                        : undefined
                    }
                  />
                  <InsightCard
                    title="Pedidos com problemas"
                    value={formatNumber(totalQualityIssues)}
                    description="Soma dos principais indicadores (último snapshot)."
                    badge={
                      totalQualityIssues === 0
                        ? { label: "OK", tone: "success" }
                        : { label: "Atenção", tone: "warning" }
                    }
                  />
                </div>
              </Section>

              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <ChartCard
                    title="Receita por vendedor"
                    subtitle="Top 10 vendedores por receita (alias amigável)."
                  >
                    <SellerRevenueBarChart data={sellerChartData} />
                  </ChartCard>
                </div>
                <div className="lg:col-span-4">
                  <ChartCard
                    title="Receita por categoria"
                    subtitle="Top 10 categorias por receita."
                  >
                    <ProductCategoryBarChart rows={products} limit={10} />
                  </ChartCard>
                </div>
                <div className="lg:col-span-4">
                  <QualityList
                    items={reliabilityMetrics.map((m) => ({
                      title: m.label,
                      value: formatNumber(m.value),
                      status: m.status,
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <DataTable
                    caption="Mostrando top 10 registros"
                    columns={[
                      { key: "table_name", header: OVERVIEW_COLUMN_LABELS.table_name },
                      {
                        key: "row_count",
                        header: OVERVIEW_COLUMN_LABELS.row_count,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.row_count),
                      },
                    ]}
                    rows={overview.tables.map((row) => ({
                      ...row,
                      table_name: MART_TABLE_LABELS[row.table_name] ?? row.table_name,
                    }))}
                  />
                </div>
                <div className="lg:col-span-5">
                  <StepFlow
                    caption="Arquitetura (compacta)"
                    steps={[
                      "CSV Olist",
                      "Python Pipeline",
                      "Bronze",
                      "dbt Silver",
                      "dbt Gold",
                      "FastAPI",
                      "Dashboard",
                    ]}
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "qualidade",
          content: (
            <Section
              title="Central de Confiabilidade dos Dados"
              description="Monitore inconsistências que podem afetar relatórios e decisões."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reliabilityMetrics.map((m) => (
                  <StatusCard
                    key={m.key}
                    title={m.label}
                    value={formatNumber(m.value)}
                    helper={
                      totalOrdersValue
                        ? `${formatPercent(m.value / totalOrdersValue)} do total de pedidos (${formatNumber(
                            totalOrdersValue,
                          )}).`
                        : "Comparação por proporção indisponível (total de pedidos não encontrado no snapshot)."
                    }
                    status={m.status}
                  />
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-zinc-50">
                  Detalhamento dos indicadores de qualidade
                </div>
                <DataTable
                  caption="Mostrando top 10 registros"
                  columns={[
                    {
                      key: "metric_name",
                      header: DATA_QUALITY_COLUMN_LABELS.metric_name,
                      render: (r) =>
                        DATA_QUALITY_METRIC_LABELS[r.metric_name] ?? r.metric_name,
                    },
                    {
                      key: "metric_value",
                      header: DATA_QUALITY_COLUMN_LABELS.metric_value,
                      className: "text-right tabular-nums",
                      render: (r) => formatNumber(r.metric_value),
                    },
                    {
                      key: "checked_at",
                      header: DATA_QUALITY_COLUMN_LABELS.checked_at,
                      render: (r) => formatDateTime(r.checked_at),
                    },
                  ]}
                  rows={dataQuality.slice(0, 10)}
                />
              </div>
            </Section>
          ),
        },
        {
          id: "vendas",
          content: (
            <Section
              title={SECTION_TITLES.salesDaily}
              description="Acompanhe volume de pedidos, receita e ticket médio ao longo do tempo."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Receita por mês"
                  subtitle="Agregado no frontend a partir dos dados diários (últimos 12 meses)."
                >
                  <SalesDailyLineChart rows={salesDaily} limit={12} />
                </ChartCard>
                <DataTable
                  columns={[
                    {
                      key: "order_date",
                      header: SALES_DAILY_COLUMN_LABELS.order_date,
                      render: (r) => formatDate(r.order_date),
                    },
                    {
                      key: "total_orders",
                      header: SALES_DAILY_COLUMN_LABELS.total_orders,
                      className: "text-right tabular-nums",
                      render: (r) => formatNumber(r.total_orders),
                    },
                    {
                      key: "total_revenue",
                      header: SALES_DAILY_COLUMN_LABELS.total_revenue,
                      className: "text-right tabular-nums",
                      render: (r) => formatCurrencyBRL(r.total_revenue),
                    },
                    {
                      key: "average_ticket",
                      header: SALES_DAILY_COLUMN_LABELS.average_ticket,
                      className: "text-right tabular-nums",
                      render: (r) => formatCurrencyBRL(r.average_ticket),
                    },
                  ]}
                  rows={salesDaily.slice(0, 10)}
                  caption="Mostrando top 10 registros"
                />
              </div>
            </Section>
          ),
        },
        {
          id: "entregas",
          content: (
            <Section
              title={SECTION_TITLES.deliveryPerformance}
              description="Identifique estados com maior taxa de atraso e maior tempo médio de entrega."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Taxa de atraso por estado (top 10)"
                  subtitle="Ordenado por maior taxa de atraso."
                >
                  <DeliveryStateBarChart rows={delivery} limit={10} />
                </ChartCard>
                <DataTable
                  columns={[
                    {
                      key: "customer_state",
                      header: DELIVERY_PERFORMANCE_COLUMN_LABELS.customer_state,
                    },
                    {
                      key: "late_delivery_rate",
                      header: DELIVERY_PERFORMANCE_COLUMN_LABELS.late_delivery_rate,
                      className: "text-right tabular-nums",
                      render: (r) => formatPercent(r.late_delivery_rate),
                    },
                    {
                      key: "avg_delivery_time_days",
                      header: DELIVERY_PERFORMANCE_COLUMN_LABELS.avg_delivery_time_days,
                      className: "text-right tabular-nums",
                      render: (r) =>
                        r.avg_delivery_time_days == null
                          ? "—"
                          : Number(r.avg_delivery_time_days).toFixed(2),
                    },
                  ]}
                  rows={[...delivery]
                    .sort(
                      (a, b) =>
                        (toNumber(b.late_delivery_rate) ?? 0) -
                        (toNumber(a.late_delivery_rate) ?? 0),
                    )
                    .slice(0, 10)}
                  caption="Mostrando top 10 registros"
                />
              </div>
            </Section>
          ),
        },
        {
          id: "vendedores",
          content: (
            <Section
              title={SECTION_TITLES.sellerPerformance}
              description="Ranking top 10 por receita (sem nomes reais, apenas alias amigável)."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Receita por vendedor (top 10)"
                  subtitle="Ranking por receita total."
                >
                  <SellerRevenueBarChart data={sellerChartData} />
                </ChartCard>
                <DataTable
                  columns={[
                    {
                      key: "seller_id",
                      header: SELLER_PERFORMANCE_COLUMN_LABELS.seller_id,
                      render: (r) => {
                        const meta = sellerAliases.get(String(r.seller_id));
                        const alias = meta?.alias ?? "Vendedor #???";
                        const title = meta?.seller_id_trunc
                          ? `seller_id: ${meta.seller_id_trunc}`
                          : `seller_id: ${truncateId(r.seller_id)}`;
                        return (
                          <span title={title} className="whitespace-nowrap">
                            {alias}
                          </span>
                        );
                      },
                    },
                    {
                      key: "total_revenue",
                      header: SELLER_PERFORMANCE_COLUMN_LABELS.total_revenue,
                      className: "text-right tabular-nums",
                      render: (r) => formatCurrencyBRL(r.total_revenue),
                    },
                    {
                      key: "avg_review_score",
                      header: SELLER_PERFORMANCE_COLUMN_LABELS.avg_review_score,
                      className: "text-right tabular-nums",
                      render: (r) =>
                        r.avg_review_score == null
                          ? "—"
                          : Number(r.avg_review_score).toFixed(2),
                    },
                    {
                      key: "late_delivery_rate",
                      header: SELLER_PERFORMANCE_COLUMN_LABELS.late_delivery_rate,
                      className: "text-right tabular-nums",
                      render: (r) => formatPercent(r.late_delivery_rate),
                    },
                  ]}
                  rows={sellersTop10}
                  caption="Mostrando top 10 registros"
                />
              </div>
            </Section>
          ),
        },
        {
          id: "produtos",
          content: (
            <Section
              title={SECTION_TITLES.productPerformance}
              description="Ranking top 10 de categorias por receita."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Receita por categoria (top 10)"
                  subtitle="Ordenado por maior receita."
                >
                  <ProductCategoryBarChart rows={products} limit={10} />
                </ChartCard>
                <DataTable
                  columns={[
                    {
                      key: "product_category_name_english",
                      header:
                        PRODUCT_PERFORMANCE_COLUMN_LABELS.product_category_name_english,
                    },
                    {
                      key: "total_revenue",
                      header: PRODUCT_PERFORMANCE_COLUMN_LABELS.total_revenue,
                      className: "text-right tabular-nums",
                      render: (r) => formatCurrencyBRL(r.total_revenue),
                    },
                    {
                      key: "avg_item_price",
                      header: PRODUCT_PERFORMANCE_COLUMN_LABELS.avg_item_price,
                      className: "text-right tabular-nums",
                      render: (r) => formatCurrencyBRL(r.avg_item_price),
                    },
                  ]}
                  rows={[...products]
                    .sort(
                      (a, b) =>
                        (toNumber(b.total_revenue) ?? 0) -
                        (toNumber(a.total_revenue) ?? 0),
                    )
                    .slice(0, 10)}
                  caption="Mostrando top 10 registros"
                />
              </div>
            </Section>
          ),
        },
      ]}
    />
  );
}
