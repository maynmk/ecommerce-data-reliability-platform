"use client";

import * as React from "react";

import { OptionPills, type OptionPill } from "@/components/OptionPills";
import { ChartCard } from "@/components/charts/ChartCard";
import { DeliveryStateBarChart } from "@/components/charts/DeliveryStateBarChart";
import { SalesDailyLineChart, type SalesKpiMode } from "@/components/charts/SalesDailyLineChart";
import { formatNumber } from "@/lib/format";
import type { DeliveryPerformanceRow, SalesDailyRow } from "@/lib/types";

type ActiveKpi =
  | "revenue"
  | "orders"
  | "ticket"
  | "delivered"
  | "late"
  | "quality";

const KPI_OPTIONS: OptionPill[] = [
  { id: "revenue", label: "Receita" },
  { id: "orders", label: "Pedidos" },
  { id: "ticket", label: "Ticket médio" },
  { id: "delivered", label: "Entregas" },
  { id: "late", label: "Atrasos" },
  { id: "quality", label: "Qualidade dos dados" },
];

function chartMeta(active: ActiveKpi): { title: string; subtitle: string } {
  switch (active) {
    case "orders":
      return {
        title: "Pedidos por mês",
        subtitle: "Agregado no frontend a partir dos dados diários (últimos 12 meses).",
      };
    case "ticket":
      return {
        title: "Ticket médio por mês",
        subtitle: "Calculado por mês (receita total ÷ pedidos totais).",
      };
    case "delivered":
      return {
        title: "Entregas por mês",
        subtitle: "Pedidos entregues por mês (a partir da série diária).",
      };
    case "late":
      return {
        title: "Atrasos por estado",
        subtitle: "Top 10 estados por taxa de atraso (métrica agregada).",
      };
    case "quality":
      return {
        title: "Resumo de qualidade",
        subtitle: "Métrica detalhada disponível na Central de Confiabilidade.",
      };
    case "revenue":
    default:
      return {
        title: "Receita por mês",
        subtitle: "Agregado no frontend a partir dos dados diários (últimos 12 meses).",
      };
  }
}

function toSalesMode(active: ActiveKpi): SalesKpiMode | null {
  if (active === "revenue") return "revenue";
  if (active === "orders") return "orders";
  if (active === "ticket") return "ticket";
  if (active === "delivered") return "delivered";
  return null;
}

export function OperationalKpiPanel({
  salesDailyRows,
  deliveryRows,
  totalQualityIssues,
}: {
  salesDailyRows: SalesDailyRow[];
  deliveryRows: DeliveryPerformanceRow[];
  totalQualityIssues: number;
}) {
  const [active, setActive] = React.useState<ActiveKpi>("revenue");

  const onChange = (id: string) => {
    const next = id as ActiveKpi;
    setActive(next);

    if (next === "quality") {
      const el = document.getElementById("quality-center");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const meta = chartMeta(active);
  const salesMode = toSalesMode(active);

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <ChartCard title={meta.title} subtitle={meta.subtitle} className="min-h-[420px]">
          {salesMode ? (
            <SalesDailyLineChart rows={salesDailyRows} limit={12} mode={salesMode} />
          ) : active === "late" ? (
            <DeliveryStateBarChart rows={deliveryRows} limit={10} />
          ) : (
            <div className="flex h-full flex-col justify-center rounded-xl border border-emerald-500/10 bg-zinc-950/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Central de Confiabilidade
              </div>
              <div className="mt-2 text-3xl font-semibold text-zinc-50 tabular-nums">
                {formatNumber(totalQualityIssues)}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-300">
                Soma dos principais indicadores do último snapshot. Clique em{" "}
                <span className="font-semibold text-emerald-200">
                  Qualidade dos dados
                </span>{" "}
                para navegar até os detalhes.
              </div>
              <div className="mt-4 text-xs text-zinc-400">
                Métrica disponível na Central de Confiabilidade.
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:col-span-4 lg:h-full lg:grid-rows-2">
        <ChartCard
          title="Performance por Estado"
          subtitle="Top 10 estados por taxa de atraso."
          className="min-h-[200px]"
        >
          <DeliveryStateBarChart rows={deliveryRows} limit={10} />
        </ChartCard>

        <OptionPills
          title="KPIs Operacionais"
          options={KPI_OPTIONS}
          activeId={active}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

