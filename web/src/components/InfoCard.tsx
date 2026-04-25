import * as React from "react";

export function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-600">{description}</div>
    </div>
  );
}

