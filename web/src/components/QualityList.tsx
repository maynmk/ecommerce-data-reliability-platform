import * as React from "react";

import { Badge } from "@/components/Badge";

type Status = "OK" | "Atenção" | "Crítico";

export function QualityList({
  items,
}: {
  items: Array<{ title: string; value: React.ReactNode; status: Status }>;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-emerald-500/15 bg-zinc-950/25 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-50">
          Central de Confiabilidade
        </div>
        <Badge tone="brand">Gold</Badge>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((it) => {
          const tone =
            it.status === "OK"
              ? "success"
              : it.status === "Atenção"
                ? "warning"
                : "danger";
          return (
            <div
              key={it.title}
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/10 bg-zinc-950/20 px-3 py-2"
            >
              <div className="min-w-0 text-sm text-zinc-200">{it.title}</div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-sm font-semibold text-zinc-50 tabular-nums">
                  {it.value}
                </div>
                <Badge tone={tone}>{it.status}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
