import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/Badge";
import { Shell } from "@/components/Shell";
import { ExecutiveCard } from "@/components/ExecutiveCard";
import { InfoCard } from "@/components/InfoCard";
import { Section } from "@/components/Section";
import { StatusCard } from "@/components/StatusCard";
import { StepFlow } from "@/components/StepFlow";
import { ChartCard } from "@/components/charts/ChartCard";
import { DeliveryStateBarChart } from "@/components/charts/DeliveryStateBarChart";
import { ProductCategoryBarChart } from "@/components/charts/ProductCategoryBarChart";
import { SalesDailyLineChart } from "@/components/charts/SalesDailyLineChart";
import { apiGet } from "@/lib/api";
import {
  formatCurrencyBRL,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
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

function badgeForRate(rate: number | null): { label: string; tone: "neutral" | "warning" | "danger" } | null {
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
  const totalOrdersValue = totalOrdersSnapshot ? toNumber(totalOrdersSnapshot.metric_value) : null;
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
      value: toNumber(snapshot.find((m) => m.metric_name === key)?.metric_value) ?? 0,
    }))
    .map((m) => ({
      ...m,
      status: classifyReliability(m.value, totalOrdersValue),
    }));

  const lateBadge = badgeForRate(lateRate);

  return (
    <Shell
      title="Central de Performance e Confiabilidade do E-commerce"
      subtitle="Monitore vendas, entregas, vendedores, produtos e qualidade dos dados a partir de uma arquitetura analítica com Bronze, Silver e Gold."
      badges={HERO_BADGES}
      nav={[
        { id: "visao-geral", label: "Visão geral" },
        { id: "vendas", label: "Vendas" },
        { id: "entregas", label: "Entregas" },
        { id: "vendedores", label: "Vendedores" },
        { id: "produtos", label: "Produtos" },
        { id: "qualidade", label: "Qualidade dos dados" },
      ]}
    >
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Resumo executivo
            </div>
            <div className="text-sm text-zinc-600">
              {lastSalesDate ? `Última data de vendas: ${formatDate(lastSalesDate)}.` : null}{" "}
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div id="visao-geral" className="scroll-mt-28">
        <Section
          title={SECTION_TITLES.overview}
          description="Visão rápida do que está sendo materializado na camada Gold e do último snapshot de qualidade do dado."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <DataTable
              caption="Contagem de linhas por tabela (schema gold)"
              columns={[
                { key: "table_name", header: OVERVIEW_COLUMN_LABELS.table_name },
                {
                  key: "row_count",
                  header: OVERVIEW_COLUMN_LABELS.row_count,
                  className: "text-right",
                  render: (r) => formatNumber(r.row_count),
                },
              ]}
              rows={overview.tables.map((row) => ({
                ...row,
                table_name: MART_TABLE_LABELS[row.table_name] ?? row.table_name,
              }))}
            />

            <DataTable
              caption="Último snapshot de qualidade do dado (schema gold)"
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
                  className: "text-right",
                  render: (r) => formatNumber(r.metric_value),
                },
                {
                  key: "checked_at",
                  header: DATA_QUALITY_COLUMN_LABELS.checked_at,
                  render: (r) => formatDateTime(r.checked_at),
                },
              ]}
              rows={overview.data_quality}
            />
          </div>
        </Section>
      </div>

      <div id="qualidade" className="scroll-mt-28">
        <Section
          title="Central de Confiabilidade dos Dados"
          description="Monitore inconsistências que podem afetar relatórios, dashboards e decisões de negócio."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </Section>
      </div>

      <Section
        title="Perguntas que este painel responde"
        description="Um recorte executivo para orientar análises e priorização."
      >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              title="Como as vendas evoluem por dia?"
              description="Acompanhe volume de pedidos, receita, frete, ticket e avaliação ao longo do tempo."
            />
            <InfoCard
              title="Quais estados têm maior atraso?"
              description="Identifique onde a operação precisa de atenção e onde o prazo tem maior risco."
            />
            <InfoCard
              title="Quais vendedores geram mais receita?"
              description="Compare performance por receita, itens vendidos, nota média e atraso."
            />
            <InfoCard
              title="Quais categorias vendem melhor?"
              description="Entenda quais categorias puxam volume, receita e satisfação do cliente."
            />
            <InfoCard
              title="Existem falhas de dados que afetam a análise?"
              description="Monitore inconsistências que distorcem relatórios, dashboards e decisões."
            />
          </div>
      </Section>

      <div id="vendas" className="scroll-mt-28">
        <Section
          title={SECTION_TITLES.salesDaily}
          description="Acompanhe volume de pedidos, receita, frete, ticket médio e avaliação ao longo do tempo."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Vendas por dia (últimos 30 dias)"
              subtitle="Pedidos e receita agregados por data."
            >
              <SalesDailyLineChart rows={salesDaily} limit={30} />
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
              caption="Mostrando os 10 registros mais recentes."
            />
          </div>
        </Section>
      </div>

      <div id="entregas" className="scroll-mt-28">
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
              caption="Mostrando top 10 estados."
            />
          </div>
        </Section>
      </div>

      <div id="vendedores" className="scroll-mt-28">
        <Section
          title={SECTION_TITLES.sellerPerformance}
          description="Compare vendedores por receita, itens vendidos, nota média e atraso."
        >
          <DataTable
            columns={[
              {
                key: "seller_id",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.seller_id,
                render: (r) => truncateId(r.seller_id),
              },
              {
                key: "seller_state",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.seller_state,
              },
              {
                key: "total_orders",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.total_orders,
                className: "text-right tabular-nums",
                render: (r) => formatNumber(r.total_orders),
              },
              {
                key: "total_revenue",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.total_revenue,
                className: "text-right tabular-nums",
                render: (r) => formatCurrencyBRL(r.total_revenue),
              },
              {
                key: "avg_item_price",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.avg_item_price,
                className: "text-right tabular-nums",
                render: (r) => formatCurrencyBRL(r.avg_item_price),
              },
              {
                key: "avg_review_score",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.avg_review_score,
                className: "text-right tabular-nums",
                render: (r) => (r.avg_review_score == null ? "—" : Number(r.avg_review_score).toFixed(2)),
              },
              {
                key: "late_delivery_rate",
                header: SELLER_PERFORMANCE_COLUMN_LABELS.late_delivery_rate,
                className: "text-right tabular-nums",
                render: (r) => formatPercent(r.late_delivery_rate),
              },
            ]}
            rows={sellers.slice(0, 20)}
            caption="Mostrando top 20 registros."
          />
        </Section>
      </div>

      <div id="produtos" className="scroll-mt-28">
        <Section
          title={SECTION_TITLES.productPerformance}
          description="Analise categorias com maior volume, receita, frete médio e satisfação dos clientes."
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
                  header: PRODUCT_PERFORMANCE_COLUMN_LABELS.product_category_name_english,
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
              rows={products.slice(0, 10)}
              caption="Mostrando top 10 categorias."
            />
          </div>
        </Section>
      </div>

      <Section
        title={SECTION_TITLES.dataQualityCenter}
        description="Monitore inconsistências que podem distorcer análises e relatórios."
      >
          <DataTable
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
          rows={dataQuality.slice(0, 20)}
          caption="Mostrando as 20 medições mais recentes (limit=200)."
        />
      </Section>

      <Section
        title="Arquitetura dos Dados"
        description="Este dashboard consome somente métricas da camada Gold expostas pela API FastAPI, evitando acesso direto aos dados brutos."
      >
          <StepFlow
            caption="Fluxo de dados (fim a fim)"
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
      </Section>
    </Shell>
  );
}
