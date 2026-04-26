"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrencyBRL, formatNumber, toNumber } from "@/lib/format";
import type { SalesDailyRow } from "@/lib/types";

export type SalesKpiMode = "dual" | "revenue" | "orders" | "ticket" | "delivered";

function extractMonthKey(orderDate: unknown): string | null {
  const raw = String(orderDate ?? "");
  // API/dbt geralmente envia `YYYY-MM-DD` (às vezes com tempo). Para o gráfico, usamos `YYYY-MM`.
  const match = raw.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function tooltipFormatter(value: unknown, name: string, mode: SalesKpiMode) {
  if (mode === "dual" && name === "Receita") return formatCurrencyBRL(value);
  if (mode === "revenue" || mode === "ticket") return formatCurrencyBRL(value);
  return formatNumber(value);
}

function formatMonthLabel(value: string): string {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function SalesDailyLineChart({
  rows,
  limit = 12,
  mode = "dual",
}: {
  rows: SalesDailyRow[];
  limit?: number;
  mode?: SalesKpiMode;
}) {
  const monthly = new Map<
    string,
    { orders: number; revenue: number; delivered: number }
  >();
  for (const r of rows) {
    const monthKey = extractMonthKey(r.order_date);
    if (!monthKey) continue;
    const current = monthly.get(monthKey) ?? { orders: 0, revenue: 0, delivered: 0 };
    current.orders += toNumber(r.total_orders) ?? 0;
    current.revenue += toNumber(r.total_revenue) ?? 0;
    current.delivered += toNumber(r.delivered_orders) ?? 0;
    monthly.set(monthKey, current);
  }

  const data = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([month, values]) => ({
      month,
      orders: values.orders,
      revenue: values.revenue,
      delivered: values.delivered,
      ticket: values.orders > 0 ? values.revenue / values.orders : null,
    }));

  const showDual = mode === "dual";
  const showCurrency = mode === "revenue" || mode === "ticket";

  const hasAnyData = (() => {
    if (data.length === 0) return false;
    if (mode === "dual") {
      return data.some((d) => d.orders > 0 || d.revenue > 0);
    }
    if (mode === "revenue") return data.some((d) => d.revenue > 0);
    if (mode === "orders") return data.some((d) => d.orders > 0);
    if (mode === "delivered") return data.some((d) => d.delivered > 0);
    return data.some((d) => isFiniteNumber(d.ticket) && d.ticket > 0);
  })();

  if (!hasAnyData) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-emerald-500/10 bg-zinc-950/20 px-4 text-sm text-zinc-300">
        Sem dados disponíveis para esta visualização.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.12)" />
        <XAxis
          dataKey="month"
          tickFormatter={(v) => formatMonthLabel(String(v))}
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
          tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
          minTickGap={18}
        />
        {showDual ? (
          <>
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => formatNumber(v)}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
              tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => formatCurrencyBRL(v)}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              width={86}
              axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
              tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
            />
          </>
        ) : (
          <YAxis
            tickFormatter={(v) => (showCurrency ? formatCurrencyBRL(v) : formatNumber(v))}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            width={showCurrency ? 86 : 50}
            axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
            tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
          />
        )}
        <Tooltip
          formatter={(v, n) => tooltipFormatter(v, String(n), mode)}
          labelFormatter={(label) => formatMonthLabel(String(label))}
          cursor={{ fill: "rgba(34,197,94,0.08)" }}
          contentStyle={{
            background: "rgba(9,12,10,0.92)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12,
            color: "#e5e7eb",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        {showDual ? (
          <>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              name="Pedidos"
              stroke="#a1a1aa"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Receita"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </>
        ) : (
          <Line
            type="monotone"
            dataKey={
              mode === "revenue"
                ? "revenue"
                : mode === "orders"
                  ? "orders"
                  : mode === "ticket"
                    ? "ticket"
                    : "delivered"
            }
            name={
              mode === "revenue"
                ? "Receita"
                : mode === "orders"
                  ? "Pedidos"
                  : mode === "ticket"
                    ? "Ticket médio"
                    : "Entregas"
            }
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
