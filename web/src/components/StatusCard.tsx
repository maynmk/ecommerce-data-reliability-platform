import * as React from "react";

import { Badge } from "@/components/Badge";

type Status = "OK" | "Atenção" | "Crítico";

export function StatusCard({
  title,
  value,
  helper,
  status,
}: {
  title: string;
  value: React.ReactNode;
  helper: string;
  status: Status;
}) {
  const tone =
    status === "OK" ? "success" : status === "Atenção" ? "warning" : "danger";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-900">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-600">{helper}</div>
    </div>
  );
}

