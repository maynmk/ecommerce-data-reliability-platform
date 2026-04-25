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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        {subtitle ? (
          <div className="text-xs leading-5 text-zinc-600">{subtitle}</div>
        ) : null}
      </div>
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}

