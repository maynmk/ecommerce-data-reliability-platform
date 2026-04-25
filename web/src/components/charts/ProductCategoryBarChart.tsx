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

export function ProductCategoryBarChart({
  rows,
  limit = 10,
}: {
  rows: ProductPerformanceRow[];
  limit?: number;
}) {
  const data = [...rows]
    .map((r) => ({
      category: String(r.product_category_name_english ?? "unknown"),
      total_revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="category"
          tick={{ fill: "#52525b", fontSize: 12 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tickFormatter={(v) => formatCurrencyBRL(v)}
          tick={{ fill: "#52525b", fontSize: 12 }}
          width={86}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <Tooltip
          formatter={(v) => tooltipFormatter(v)}
          cursor={{ fill: "rgba(24,24,27,0.04)" }}
        />
        <Bar dataKey="total_revenue" fill="#18181b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

