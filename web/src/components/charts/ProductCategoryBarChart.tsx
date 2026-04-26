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

import { formatCurrencyBRL, formatCurrencyBRLCompact, toNumber } from "@/lib/format";
import { labelProductCategory } from "@/lib/labels";
import type { ProductPerformanceRow } from "@/lib/types";

function tooltipFormatter(value: unknown) {
  return formatCurrencyBRL(value);
}

export function ProductCategoryBarChart({
  rows,
  limit = 10,
  height,
  scrollable = false,
}: {
  rows: ProductPerformanceRow[];
  limit?: number;
  height?: number;
  scrollable?: boolean;
}) {
  const data = [...rows]
    .map((r) => ({
      category: labelProductCategory(String(r.product_category_name_english ?? "unknown")),
      total_revenue: toNumber(r.total_revenue) ?? 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);
  const chartHeight = height ?? Math.max(data.length * 42, 420);

  return (
    <div
      className={[
        "h-full",
        scrollable ? "overflow-y-auto overflow-x-hidden pr-1" : "overflow-hidden",
      ].join(" ")}
    >
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 28, left: 28, bottom: 12 }}
            barCategoryGap={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.12)" />
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrencyBRLCompact(v)}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
              tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
              tickMargin={6}
              tickCount={4}
              interval={0}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "rgba(34,197,94,0.12)" }}
              tickLine={{ stroke: "rgba(34,197,94,0.12)" }}
              width={156}
              interval={0}
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
            <Bar dataKey="total_revenue" fill="#22c55e" radius={[0, 8, 8, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
