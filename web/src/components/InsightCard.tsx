import * as React from "react";

import { Badge } from "@/components/Badge";

export function InsightCard({
  title,
  value,
  description,
  badge,
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  badge?: { label: string; tone: "neutral" | "success" | "warning" | "danger" };
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-zinc-950/30 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {title}
        </div>
        {badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}
      </div>
      <div className="mt-2 text-xl font-semibold text-zinc-50 tabular-nums">
        {value}
      </div>
      <div className="mt-2 text-sm leading-6 text-zinc-300">{description}</div>
    </div>
  );
}
