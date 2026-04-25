import * as React from "react";

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/35 p-4 shadow-sm">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-zinc-50">{title}</div>
        {subtitle ? (
          <div className="text-xs leading-5 text-zinc-300">{subtitle}</div>
        ) : null}
      </div>
      <div className="mt-4 h-56">{children}</div>
    </div>
  );
}
