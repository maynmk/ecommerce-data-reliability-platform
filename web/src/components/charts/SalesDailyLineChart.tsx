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

import { formatCurrencyBRL, formatDate, formatNumber, toNumber } from "@/lib/format";
import type { SalesDailyRow } from "@/lib/types";

function tooltipFormatter(value: unknown, name: string) {
  if (name === "Receita") return formatCurrencyBRL(value);
  return formatNumber(value);
}

export function SalesDailyLineChart({
  rows,
  limit = 30,
}: {
  rows: SalesDailyRow[];
  limit?: number;
}) {
  const data = [...rows]
    .slice(0, limit)
    .reverse()
    .map((r) => ({
      order_date: r.order_date,
      orders: toNumber(r.total_orders) ?? 0,
      revenue: toNumber(r.total_revenue) ?? 0,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="order_date"
          tickFormatter={(v) => formatDate(v)}
          tick={{ fill: "#52525b", fontSize: 12 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
          minTickGap={24}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => formatNumber(v)}
          tick={{ fill: "#52525b", fontSize: 12 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => formatCurrencyBRL(v)}
          tick={{ fill: "#52525b", fontSize: 12 }}
          width={86}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <Tooltip
          formatter={(v, n) => tooltipFormatter(v, String(n))}
          labelFormatter={(label) => formatDate(label)}
          cursor={{ fill: "rgba(24,24,27,0.04)" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="orders"
          name="Pedidos"
          stroke="#18181b"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          name="Receita"
          stroke="#71717a"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

