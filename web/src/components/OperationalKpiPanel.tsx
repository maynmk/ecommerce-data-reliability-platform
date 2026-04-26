"use client";

import * as React from "react";

import { OptionPills, type OptionPill } from "@/components/OptionPills";
import { ChartCard } from "@/components/charts/ChartCard";
import { DeliveryStateBarChart } from "@/components/charts/DeliveryStateBarChart";
import { SalesDailyLineChart, type SalesKpiMode } from "@/components/charts/SalesDailyLineChart";
import { formatNumber } from "@/lib/format";
import type { DeliveryPerformanceRow, SalesDailyRow } from "@/lib/types";

type ActiveKpi =
  | "all"
  | "revenue"
  | "orders"
  | "ticket"
  | "delivered"
  | "late"
  | "quality";

const KPI_OPTIONS: OptionPill[] = [
  {
    id: "all",
    label: "Todos",
    activeClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    activeDotClassName: "bg-emerald-300",
  },
  {
    id: "revenue",
    label: "Receita",
    activeClassName: "border-green-500/40 bg-green-500/10 text-green-100",
    activeDotClassName: "bg-green-400",
  },
  {
    id: "orders",
    label: "Pedidos",
    activeClassName: "border-sky-500/40 bg-sky-500/10 text-sky-100",
    activeDotClassName: "bg-sky-400",
  },
  {
    id: "ticket",
    label: "Ticket médio",
    activeClassName: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
    activeDotClassName: "bg-cyan-400",
  },
  {
    id: "delivered",
    label: "Entregas",
    activeClassName: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
    activeDotClassName: "bg-emerald-400",
  },
  {
    id: "late",
    label: "Atrasos",
    activeClassName: "border-amber-500/40 bg-amber-500/10 text-amber-100",
    activeDotClassName: "bg-amber-400",
  },
  {
    id: "quality",
    label: "Qualidade dos dados",
    activeClassName: "border-rose-500/40 bg-rose-500/10 text-rose-100",
    activeDotClassName: "bg-rose-400",
  },
];

function chartMeta(active: ActiveKpi): { title: string; subtitle: string } {
  switch (active) {
    case "all":
      return {
        title: "Visão geral por mês",
        subtitle: "Receita e pedidos por mês (últimos 12 meses).",
      };
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
        subtitle: "Indicadores de qualidade disponíveis na Central de Confiabilidade.",
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
  if (active === "all") return "dual";
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
  const [active, setActive] = React.useState<ActiveKpi>("all");

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
            deliveryRows.length > 0 ? (
              <DeliveryStateBarChart rows={deliveryRows} limit={10} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-emerald-500/10 bg-zinc-950/20 px-4 text-sm text-zinc-300">
                Métrica de atraso disponível na seção Performance por Estado.
              </div>
            )
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
