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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {caption ? (
        <div className="text-sm font-semibold text-zinc-900">{caption}</div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <Badge tone={idx === steps.length - 1 ? "brand" : "neutral"}>
              {step}
            </Badge>
            {idx < steps.length - 1 ? (
              <span className="text-zinc-400">→</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

