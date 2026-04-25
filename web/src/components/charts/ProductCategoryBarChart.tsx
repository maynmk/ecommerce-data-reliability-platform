"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrencyBRL, toNumber } from "@/lib/format";
import type { ProductPerformanceRow } from "@/lib/types";

function tooltipFormatter(value: unknown) {
  return formatCurrencyBRL(value);
}

function shortLabel(value: string): string {
  const text = value.trim();
  if (text.length <= 18) return text;
  return `${text.slice(0, 16)}…`;
}

export function ProductCategoryBarChart({
  rows,
  limit = 10,
}: {
  rows: ProductPerformanceRow[];
  limit?: number;
}) {
  const data = [...rows]
    .map((r) => ({
      category: shortLabel(String(r.product_category_name_english ?? "unknown")),
      total_revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 8, left: 32, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.12)" />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrencyBRL(v)}
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
          tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
          tickMargin={6}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
          tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
          width={110}
        />
        <Tooltip
          formatter={(v) => tooltipFormatter(v)}
          cursor={{ fill: "rgba(34,197,94,0.08)" }}
          contentStyle={{
            background: "rgba(9,12,10,0.92)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12,
            color: "#e5e7eb",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Bar dataKey="total_revenue" fill="#22c55e" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
