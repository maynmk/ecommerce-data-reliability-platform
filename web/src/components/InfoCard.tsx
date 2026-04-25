import * as React from "react";

export function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-zinc-950/20 p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-50">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-300">{description}</div>
    </div>
  );
}
