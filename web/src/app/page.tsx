import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { ExecutiveCard } from "@/components/ExecutiveCard";
import { InsightCard } from "@/components/InsightCard";
import { OperationalKpiPanel } from "@/components/OperationalKpiPanel";
import { QualityList } from "@/components/QualityList";
import { Section } from "@/components/Section";
import { ShellWithDrawer } from "@/components/ShellWithDrawer";
import { StatusCard } from "@/components/StatusCard";
import { StepFlow } from "@/components/StepFlow";
import { ChartCard } from "@/components/charts/ChartCard";
import { DeliveryStateBarChart } from "@/components/charts/DeliveryStateBarChart";
import { ProductCategoryBarChart } from "@/components/charts/ProductCategoryBarChart";
import { SalesDailyLineChart } from "@/components/charts/SalesDailyLineChart";
import { SellerRevenueBarChart } from "@/components/charts/SellerRevenueBarChart";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import {
  FiltersPanel,
  type SellerOption,
  type StatusOption,
} from "@/components/filters/FiltersPanel";
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
  labelProductCategory,
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

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string): string | null {
  const value = searchParams?.[key];
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

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

function extractMonthKey(value: unknown): string | null {
  const raw = String(value ?? "");
  const match = raw.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function formatMonthLabel(value: string): string {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

type SalesMonthlyRow = {
  month: string;
  total_orders: number;
  delivered_orders: number;
  canceled_orders: number;
  total_revenue: number;
  total_freight: number;
  average_ticket: number | null;
};

function aggregateMonthlySales(rows: SalesDailyRow[]): SalesMonthlyRow[] {
  const monthly = new Map<
    string,
    {
      total_orders: number;
      delivered_orders: number;
      canceled_orders: number;
      total_revenue: number;
      total_freight: number;
    }
  >();

  for (const row of rows) {
    const monthKey = extractMonthKey(row.order_date);
    if (!monthKey) continue;

    const current = monthly.get(monthKey) ?? {
      total_orders: 0,
      delivered_orders: 0,
      canceled_orders: 0,
      total_revenue: 0,
      total_freight: 0,
    };

    current.total_orders += toNumber(row.total_orders) ?? 0;
    current.delivered_orders += toNumber(row.delivered_orders) ?? 0;
    current.canceled_orders += toNumber(row.canceled_orders) ?? 0;
    current.total_revenue += toNumber(row.total_revenue) ?? 0;
    current.total_freight += toNumber(row.total_freight) ?? 0;
    monthly.set(monthKey, current);
  }

  return [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      ...values,
      average_ticket:
        values.total_orders > 0 ? values.total_revenue / values.total_orders : null,
    }));
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  const [overview, salesDaily, delivery, sellers, products, dataQuality] =
    await Promise.all([
      apiGet<OverviewResponse>("/metrics/overview"),
      apiGet<SalesDailyRow[]>("/metrics/sales-daily?limit=1000"),
      apiGet<DeliveryPerformanceRow[]>("/metrics/delivery-performance?limit=1000"),
      apiGet<SellerPerformanceRow[]>("/metrics/seller-performance?limit=50"),
      apiGet<ProductPerformanceRow[]>("/metrics/product-performance?limit=50"),
      apiGet<DataQualityRow[]>("/metrics/data-quality?limit=200"),
    ]);

  let periodStart = getParam(searchParams, "start") ?? "";
  let periodEnd = getParam(searchParams, "end") ?? "";
  const stateFilter = getParam(searchParams, "state") ?? "";
  const categoryFilter = getParam(searchParams, "category") ?? "";
  const sellerFilter = getParam(searchParams, "seller") ?? "";

  if (periodStart && periodEnd && periodStart > periodEnd) {
    [periodStart, periodEnd] = [periodEnd, periodStart];
  }

  const salesDailyFiltered =
    periodStart || periodEnd
      ? salesDaily.filter((r) => {
          const date = String(r.order_date ?? "");
          if (periodStart && date < periodStart) return false;
          if (periodEnd && date > periodEnd) return false;
          return true;
        })
      : salesDaily;

  const deliveryFiltered = stateFilter
    ? delivery.filter((r) => String(r.customer_state ?? "") === stateFilter)
    : delivery;

  const productsFiltered = categoryFilter
    ? products.filter(
        (r) =>
          String(r.product_category_name_english ?? "") === String(categoryFilter),
      )
    : products;

  const sellersFiltered = sellers.filter((r) => {
    if (sellerFilter && String(r.seller_id) !== String(sellerFilter)) return false;
    if (stateFilter && String(r.seller_state) !== String(stateFilter)) return false;
    return true;
  });

  const totalOrders = sum(salesDailyFiltered, "total_orders");
  const totalRevenue = sum(salesDailyFiltered, "total_revenue");
  const deliveredOrders = sum(salesDailyFiltered, "delivered_orders");
  const canceledOrders = sum(salesDailyFiltered, "canceled_orders");
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : null;

  const deliveryForKpi =
    stateFilter && deliveryFiltered.length === 0 ? delivery : deliveryFiltered;

  const totalDelivered = sum(deliveryForKpi, "delivered_orders");
  const totalLate = sum(deliveryForKpi, "late_orders");
  const lateRate = totalDelivered > 0 ? totalLate / totalDelivered : null;

  const lastSalesDate =
    salesDailyFiltered.length > 0 ? (salesDailyFiltered[0]?.order_date ?? null) : null;
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
  const salesMonthlyRows = aggregateMonthlySales(salesDailyFiltered);
  const salesDailyDetailRows = [...salesDailyFiltered].sort((a, b) =>
    String(a.order_date).localeCompare(String(b.order_date)),
  );
  const qualityDetailRows = [...dataQuality]
    .sort((a, b) => String(b.checked_at).localeCompare(String(a.checked_at)));

  const sellersSortedAll = [...sellers].sort(
    (a, b) => (toNumber(b.total_revenue) ?? 0) - (toNumber(a.total_revenue) ?? 0),
  );

  const sellerStateCounters = new Map<string, number>();
  const sellerAliases = new Map<
    string,
    { alias: string; seller_id_trunc: string; seller_state: string }
  >();

  for (const row of sellersSortedAll) {
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

  const sellersDisplaySorted = [...sellersFiltered].sort(
    (a, b) => (toNumber(b.total_revenue) ?? 0) - (toNumber(a.total_revenue) ?? 0),
  );

  const sellersTop20 = sellersDisplaySorted.slice(0, 20);
  const sellerChartDataTop20 = sellersTop20.map((row) => {
    const meta = sellerAliases.get(String(row.seller_id));
    return {
      seller_label: meta?.alias ?? "Vendedor #???",
      seller_id_trunc: meta?.seller_id_trunc ?? truncateId(row.seller_id),
      total_revenue: toNumber(row.total_revenue) ?? 0,
    };
  });
  const sellerChartDataTop6 = sellerChartDataTop20.slice(0, 6);
  const sellersDetailRows = [...sellersDisplaySorted];

  const deliveryForInsights =
    stateFilter && deliveryFiltered.length === 0 ? delivery : deliveryFiltered;

  const topLateState = [...deliveryForInsights]
    .map((r) => ({
      state: r.customer_state,
      rate: toNumber(r.late_delivery_rate) ?? 0,
    }))
    .sort((a, b) => b.rate - a.rate)[0];

  const productsForInsights =
    categoryFilter && productsFiltered.length === 0 ? products : productsFiltered;
  const productsTop20 = [...productsForInsights]
    .sort((a, b) => (toNumber(b.total_revenue) ?? 0) - (toNumber(a.total_revenue) ?? 0))
    .slice(0, 20);
  const productsTop6 = productsTop20.slice(0, 6);
  const productsDetailRows = [...productsForInsights].sort(
    (a, b) => (toNumber(b.total_revenue) ?? 0) - (toNumber(a.total_revenue) ?? 0),
  );
  const deliveriesTop20 = [...deliveryForInsights]
    .sort(
      (a, b) =>
        (toNumber(b.late_delivery_rate) ?? 0) - (toNumber(a.late_delivery_rate) ?? 0),
    )
    .slice(0, 20);
  const deliveriesDetailRows = [...deliveryForInsights].sort(
    (a, b) =>
      (toNumber(b.late_delivery_rate) ?? 0) - (toNumber(a.late_delivery_rate) ?? 0),
  );

  const topCategory = [...productsForInsights]
    .map((r) => ({
      category: String(r.product_category_name_english ?? "unknown"),
      revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)[0];

  const sellersForInsights =
    (sellerFilter || stateFilter) && sellersFiltered.length === 0 ? sellers : sellersFiltered;

  const topSeller = [...sellersForInsights]
    .map((r) => ({
      seller_id: r.seller_id,
      revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)[0];

  const stateOptions = Array.from(
    new Set([
      ...delivery.map((r) => String(r.customer_state ?? "")).filter(Boolean),
      ...sellers.map((r) => String(r.seller_state ?? "")).filter(Boolean),
    ]),
  ).sort();

  const categoryOptions = Array.from(
    new Set(
      products.map((r) => String(r.product_category_name_english ?? "")).filter(Boolean),
    ),
  ).sort();

  const sellerOptions: SellerOption[] = sellersSortedAll.map((row) => {
    const meta = sellerAliases.get(String(row.seller_id));
    return {
      seller_id: String(row.seller_id),
      alias: meta?.alias ?? "Vendedor #???",
      seller_state: meta?.seller_state ?? String(row.seller_state ?? "NA"),
      seller_id_trunc: meta?.seller_id_trunc ?? truncateId(row.seller_id),
    };
  });

  const statusOptions: StatusOption[] = [
    { value: "delivered", label: "Entregue" },
    { value: "canceled", label: "Cancelado" },
  ];

  return (
    <ShellWithDrawer
      title={
        <span>
          Central de Performance e Confiabilidade do{" "}
          <span className="text-emerald-300">E-commerce</span>
        </span>
      }
      subtitle="Monitore receita, pedidos, entregas, vendedores, produtos e qualidade dos dados em uma visão executiva alimentada por camadas Bronze, Silver e Gold."
      badges={HERO_BADGES}
      drawerTitle="Filtros"
      drawerContent={
        <FiltersPanel
          states={stateOptions}
          categories={categoryOptions}
          sellers={sellerOptions}
          statuses={statusOptions}
        />
      }
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
          <div className="mb-3">
            <ActiveFilterChips sellerOptions={sellerOptions} statuses={statusOptions} />
          </div>
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

          <div className="mt-4 grid items-stretch gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
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
            <div className="space-y-5">
              <OperationalKpiPanel
                salesDailyRows={salesDailyFiltered}
                deliveryRows={deliveryForInsights}
                totalQualityIssues={totalQualityIssues}
              />

              <Section
                title="Insights executivos"
                description="Destaques no topo do funil de análise."
              >
                <div className="grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

              <div className="grid auto-rows-fr items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <ChartCard
                    title="Top 6 vendedores por receita"
                    subtitle="Resumo executivo com alias amigável dos sellers."
                    className="min-h-[260px]"
                  >
                    <SellerRevenueBarChart data={sellerChartDataTop6} height={260} />
                  </ChartCard>
                </div>
                <div className="lg:col-span-4">
                  <ChartCard
                    title="Top 6 categorias por receita"
                    subtitle="Resumo executivo com labels amigáveis."
                    className="min-h-[260px]"
                  >
                    <ProductCategoryBarChart rows={productsTop6} limit={6} height={260} />
                  </ChartCard>
                </div>
                <div id="quality-center" className="lg:col-span-4 min-h-[320px]">
                  <QualityList
                    items={reliabilityMetrics.map((m) => ({
                      title: m.label,
                      value: formatNumber(m.value),
                      status: m.status,
                    }))}
                  />
                </div>
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
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
                <div className="lg:col-span-5 h-full">
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatusCard
                  title="Total de pedidos"
                  value={formatNumber(totalOrdersValue)}
                  helper="Base de referência usada para calcular a proporção dos problemas."
                  status={totalOrdersValue ? "OK" : "Atenção"}
                />
                <StatusCard
                  title="Indicadores com problema"
                  value={formatNumber(totalQualityIssues)}
                  helper="Soma dos principais indicadores de qualidade observados no snapshot."
                  status={totalQualityIssues === 0 ? "OK" : "Atenção"}
                />
                <StatusCard
                  title="Última verificação"
                  value={latestQualityCheckedAt ? formatDateTime(latestQualityCheckedAt) : "—"}
                  helper="Timestamp da última verificação disponível na API."
                  status={latestQualityCheckedAt ? "OK" : "Atenção"}
                />
                <StatusCard
                  title="Itens monitorados"
                  value={formatNumber(reliabilityMetrics.length)}
                  helper="Quantidade de indicadores exibidos nesta aba."
                  status="OK"
                />
              </div>

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
                  caption="Tabela completa com rolagem interna"
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
                      key: "status",
                      header: "Status",
                      render: (r) => {
                        const status = classifyReliability(
                          toNumber(r.metric_value) ?? 0,
                          totalOrdersValue,
                        );
                        return (
                          <Badge
                            tone={
                              status === "OK"
                                ? "success"
                                : status === "Atenção"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {status}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "checked_at",
                      header: DATA_QUALITY_COLUMN_LABELS.checked_at,
                      render: (r) => formatDateTime(r.checked_at),
                    },
                  ]}
                  rows={qualityDetailRows}
                  emptyMessage="Dado não disponível na API atual"
                  className="h-[420px] md:h-[520px]"
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
              description="Detalhamento de vendas por período, com resumo mensal e visão diária."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ExecutiveCard
                  title="Total de pedidos"
                  value={formatNumber(totalOrders)}
                  description="Volume total considerando o filtro atual."
                />
                <ExecutiveCard
                  title="Receita total"
                  value={formatCurrencyBRL(totalRevenue)}
                  description="Soma de receita no período selecionado."
                />
                <ExecutiveCard
                  title="Ticket médio"
                  value={avgTicket === null ? "—" : formatCurrencyBRL(avgTicket)}
                  description="Receita total dividida pelo número de pedidos."
                />
                <ExecutiveCard
                  title="Frete total"
                  value={formatCurrencyBRL(sum(salesDailyFiltered, "total_freight"))}
                  description="Soma do frete na série diária disponível."
                />
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ChartCard
                    title="Receita por mês"
                    subtitle="Agregado no frontend a partir dos dados diários (últimos 20 meses)."
                    className="min-h-[360px]"
                  >
                    <SalesDailyLineChart rows={salesDailyFiltered} limit={20} mode="revenue" />
                  </ChartCard>
                </div>
                <div className="lg:col-span-5 h-full">
                  <ChartCard
                    title="Pedidos por mês"
                    subtitle="Mesma série agregada, agora destacando pedidos."
                    className="min-h-[360px]"
                  >
                    <SalesDailyLineChart rows={salesDailyFiltered} limit={20} mode="orders" />
                  </ChartCard>
                </div>
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <DataTable
                    columns={[
                      {
                        key: "month",
                        header: "Mês",
                        render: (r) => formatMonthLabel(r.month),
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
                      {
                        key: "total_freight",
                        header: "Frete total",
                        className: "text-right tabular-nums",
                        render: (r) => formatCurrencyBRL(r.total_freight),
                      },
                    ]}
                    rows={salesMonthlyRows}
                    caption="Tabela completa com rolagem interna"
                    emptyMessage="Dado não disponível na API atual"
                    className="h-[420px] md:h-[520px]"
                  />
                </div>
                <div className="lg:col-span-6">
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
                        key: "delivered_orders",
                        header: SALES_DAILY_COLUMN_LABELS.delivered_orders,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.delivered_orders),
                      },
                      {
                        key: "canceled_orders",
                        header: SALES_DAILY_COLUMN_LABELS.canceled_orders,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.canceled_orders),
                      },
                      {
                        key: "total_revenue",
                        header: SALES_DAILY_COLUMN_LABELS.total_revenue,
                        className: "text-right tabular-nums",
                        render: (r) => formatCurrencyBRL(r.total_revenue),
                      },
                      {
                        key: "total_freight",
                        header: "Frete total",
                        className: "text-right tabular-nums",
                        render: (r) => formatCurrencyBRL(r.total_freight),
                      },
                    ]}
                    rows={salesDailyDetailRows}
                    caption="Tabela completa com rolagem interna"
                    emptyMessage="Dado não disponível na API atual"
                    className="h-[420px] md:h-[520px]"
                  />
                </div>
              </div>
            </Section>
          ),
        },
        {
          id: "entregas",
          content: (
            <Section
              title={SECTION_TITLES.deliveryPerformance}
              description="Detalhamento da performance logística por estado."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ExecutiveCard
                  title="Total de pedidos"
                  value={formatNumber(totalOrders)}
                  description="Base de comparação usando a série de vendas filtrada."
                />
                <ExecutiveCard
                  title="Pedidos entregues"
                  value={formatNumber(totalDelivered)}
                  description="Total de pedidos concluídos dentro do conjunto disponível."
                />
                <ExecutiveCard
                  title="Pedidos atrasados"
                  value={formatNumber(totalLate)}
                  description="Volume de atrasos detectado por estado."
                />
                <ExecutiveCard
                  title="Tempo médio"
                  value={
                    deliveryForKpi.length === 0
                      ? "—"
                      : `${(sum(deliveryForKpi, "avg_delivery_time_days") / deliveryForKpi.length).toFixed(2)} d`
                  }
                  description="Média simples da métrica disponível na API."
                />
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ChartCard
                    title="Taxa de atraso por estado (top 20)"
                    subtitle="Ordenado por maior taxa de atraso."
                    className="min-h-[360px]"
                  >
                    <DeliveryStateBarChart rows={deliveriesTop20} limit={20} />
                  </ChartCard>
                </div>
                <div className="lg:col-span-5 h-full">
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
                      {
                        key: "avg_delay_days",
                        header: DELIVERY_PERFORMANCE_COLUMN_LABELS.avg_delay_days,
                        className: "text-right tabular-nums",
                        render: (r) =>
                          r.avg_delay_days == null ? "—" : Number(r.avg_delay_days).toFixed(2),
                      },
                    ]}
                    rows={deliveriesDetailRows}
                    caption="Tabela completa com rolagem interna"
                    emptyMessage="Dado não disponível na API atual"
                    className="h-[420px] md:h-[520px]"
                  />
                </div>
              </div>
            </Section>
          ),
        },
        {
          id: "vendedores",
          content: (
            <Section
              title={SECTION_TITLES.sellerPerformance}
              description="Ranking detalhado de vendedores com alias amigável e rastreabilidade."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ExecutiveCard
                  title="Receita total"
                  value={formatCurrencyBRL(sum(sellersFiltered, "total_revenue"))}
                  description="Somatório dos vendedores na visão atual."
                />
                <ExecutiveCard
                  title="Pedidos"
                  value={formatNumber(sum(sellersFiltered, "total_orders"))}
                  description="Volume total de pedidos atribuídos aos vendedores."
                />
                <ExecutiveCard
                  title="Itens vendidos"
                  value={formatNumber(sum(sellersFiltered, "total_items_sold"))}
                  description="Itens vendidos pelos sellers exibidos."
                />
                <ExecutiveCard
                  title="Frete total"
                  value={formatCurrencyBRL(sum(sellersFiltered, "total_freight"))}
                  description="Total de frete associado à performance dos vendedores."
                />
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ChartCard
                    title="Top 20 vendedores por receita"
                    subtitle="Ranking top 20 por receita total."
                    className="h-[520px]"
                  >
                    <SellerRevenueBarChart
                      data={sellerChartDataTop20}
                      height={Math.max(sellerChartDataTop20.length * 42, 420)}
                      scrollable
                    />
                  </ChartCard>
                </div>
                <div className="lg:col-span-5 h-full">
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
                        key: "total_orders",
                        header: SELLER_PERFORMANCE_COLUMN_LABELS.total_orders,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.total_orders),
                      },
                      {
                        key: "total_items_sold",
                        header: SELLER_PERFORMANCE_COLUMN_LABELS.total_items_sold,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.total_items_sold),
                      },
                      {
                        key: "total_freight",
                        header: SELLER_PERFORMANCE_COLUMN_LABELS.total_freight,
                        className: "text-right tabular-nums",
                        render: (r) => formatCurrencyBRL(r.total_freight),
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
                    rows={sellersDetailRows}
                    caption="Tabela completa com rolagem interna"
                    emptyMessage="Dado não disponível na API atual"
                    className="h-[420px] md:h-[520px]"
                  />
                </div>
              </div>
            </Section>
          ),
        },
        {
          id: "produtos",
          content: (
            <Section
              title={SECTION_TITLES.productPerformance}
              description="Ranking detalhado de categorias com métricas operacionais e financeiras."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ExecutiveCard
                  title="Receita total"
                  value={formatCurrencyBRL(sum(productsFiltered, "total_revenue"))}
                  description="Somatório das categorias na visão atual."
                />
                <ExecutiveCard
                  title="Pedidos"
                  value={formatNumber(sum(productsFiltered, "total_orders"))}
                  description="Pedidos associados às categorias exibidas."
                />
                <ExecutiveCard
                  title="Itens vendidos"
                  value={formatNumber(sum(productsFiltered, "total_items_sold"))}
                  description="Itens vendidos pelas categorias da API."
                />
                <ExecutiveCard
                  title="Frete médio"
                  value={formatCurrencyBRL(
                    productsFiltered.length > 0
                      ? sum(productsFiltered, "avg_freight_value") / productsFiltered.length
                      : null,
                  )}
                  description="Média simples do frete nas categorias disponíveis."
                />
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ChartCard
                    title="Top 20 categorias por receita"
                    subtitle="Ordenado por maior receita."
                    className="h-[520px]"
                  >
                    <ProductCategoryBarChart
                      rows={productsTop20}
                      limit={20}
                      height={Math.max(productsTop20.length * 42, 420)}
                      scrollable
                    />
                  </ChartCard>
                </div>
                <div className="lg:col-span-5 h-full">
                  <DataTable
                    columns={[
                      {
                        key: "product_category_name_english",
                        header:
                          PRODUCT_PERFORMANCE_COLUMN_LABELS.product_category_name_english,
                        render: (r) =>
                          labelProductCategory(String(r.product_category_name_english ?? "")),
                      },
                      {
                        key: "total_orders",
                        header: PRODUCT_PERFORMANCE_COLUMN_LABELS.total_orders,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.total_orders),
                      },
                      {
                        key: "total_items_sold",
                        header: PRODUCT_PERFORMANCE_COLUMN_LABELS.total_items_sold,
                        className: "text-right tabular-nums",
                        render: (r) => formatNumber(r.total_items_sold),
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
                      {
                        key: "avg_freight_value",
                        header: PRODUCT_PERFORMANCE_COLUMN_LABELS.avg_freight_value,
                        className: "text-right tabular-nums",
                        render: (r) => formatCurrencyBRL(r.avg_freight_value),
                      },
                      {
                        key: "avg_review_score",
                        header: PRODUCT_PERFORMANCE_COLUMN_LABELS.avg_review_score,
                        className: "text-right tabular-nums",
                        render: (r) =>
                          r.avg_review_score == null ? "—" : Number(r.avg_review_score).toFixed(2),
                      },
                    ]}
                    rows={productsDetailRows}
                    caption="Tabela completa com rolagem interna"
                    emptyMessage="Dado não disponível na API atual"
                    className="h-[420px] md:h-[520px]"
                  />
                </div>
              </div>
            </Section>
          ),
        },
      ]}
    />
  );
}
