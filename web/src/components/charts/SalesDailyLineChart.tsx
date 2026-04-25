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

function tooltipFormatter(value: unknown, name: string) {
  if (name === "Receita") return formatCurrencyBRL(value);
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
}: {
  rows: SalesDailyRow[];
  limit?: number;
}) {
  const monthly = new Map<string, { orders: number; revenue: number }>();
  for (const r of rows) {
    const date = new Date(String(r.order_date));
    if (Number.isNaN(date.getTime())) continue;
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const current = monthly.get(monthKey) ?? { orders: 0, revenue: 0 };
    current.orders += toNumber(r.total_orders) ?? 0;
    current.revenue += toNumber(r.total_revenue) ?? 0;
    monthly.set(monthKey, current);
  }

  const data = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([month, values]) => ({
      month,
      orders: values.orders,
      revenue: values.revenue,
    }));

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
        <Tooltip
          formatter={(v, n) => tooltipFormatter(v, String(n))}
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
      </LineChart>
    </ResponsiveContainer>
  );
}
