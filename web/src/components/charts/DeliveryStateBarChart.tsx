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

import { formatPercent, toNumber } from "@/lib/format";
import type { DeliveryPerformanceRow } from "@/lib/types";

function tooltipFormatter(value: unknown) {
  return formatPercent(value);
}

export function DeliveryStateBarChart({
  rows,
  limit = 10,
}: {
  rows: DeliveryPerformanceRow[];
  limit?: number;
}) {
  const data = [...rows]
    .map((r) => ({
      customer_state: r.customer_state,
      late_delivery_rate: toNumber(r.late_delivery_rate) ?? 0,
    }))
    .sort((a, b) => b.late_delivery_rate - a.late_delivery_rate)
    .slice(0, limit);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="customer_state"
          tick={{ fill: "#52525b", fontSize: 12 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <YAxis
          tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
          tick={{ fill: "#52525b", fontSize: 12 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <Tooltip
          formatter={(v) => tooltipFormatter(v)}
          cursor={{ fill: "rgba(24,24,27,0.04)" }}
        />
        <Bar dataKey="late_delivery_rate" fill="#18181b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

