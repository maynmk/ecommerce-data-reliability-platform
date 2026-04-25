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
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold leading-tight text-zinc-900">
            {value}
          </div>
        </div>
        {statusLabel ? <Badge tone={statusTone}>{statusLabel}</Badge> : null}
      </div>
      <div className="mt-3 text-sm leading-6 text-zinc-600">{description}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-zinc-900/0 via-zinc-900/10 to-zinc-900/0" />
    </div>
  );
}

