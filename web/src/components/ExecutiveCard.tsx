import * as React from "react";

import { Badge } from "@/components/Badge";

type StatusTone = "neutral" | "success" | "warning" | "danger";

export function ExecutiveCard({
  title,
  value,
  description,
  statusLabel,
  statusTone = "neutral",
}: {
  title: string;
  value: React.ReactNode;
  description: React.ReactNode;
  statusLabel?: string;
  statusTone?: StatusTone;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-950/40 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold leading-tight text-zinc-50 tabular-nums">
            {value}
          </div>
        </div>
        {statusLabel ? <Badge tone={statusTone}>{statusLabel}</Badge> : null}
      </div>
      <div className="mt-3 text-sm leading-6 text-zinc-300">{description}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/25 to-emerald-500/0" />
    </div>
  );
}
