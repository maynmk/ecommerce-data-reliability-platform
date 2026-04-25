import * as React from "react";

import { Badge } from "@/components/Badge";

export function StepFlow({
  steps,
  caption,
}: {
  steps: string[];
  caption?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-emerald-500/15 bg-zinc-950/25 p-4 shadow-sm">
      {caption ? (
        <div className="text-sm font-semibold text-zinc-50">{caption}</div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <Badge tone={idx === steps.length - 1 ? "brand" : "neutral"}>
              {step}
            </Badge>
            {idx < steps.length - 1 ? (
              <span className="text-zinc-500">→</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
