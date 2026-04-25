import * as React from "react";

export function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
      ) : null}
    </div>
  );
}

