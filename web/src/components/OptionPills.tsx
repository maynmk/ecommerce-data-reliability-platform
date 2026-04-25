import * as React from "react";

export function OptionPills({
  title,
  options,
  activeIndex = 0,
}: {
  title: string;
  options: string[];
  activeIndex?: number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-zinc-950/25 p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-50">{title}</div>
      <div className="mt-3 grid gap-2">
        {options.map((opt, idx) => {
          const active = idx === activeIndex;
          return (
            <div
              key={opt}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2 text-sm",
                active
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-100"
                  : "border-emerald-500/10 bg-zinc-950/20 text-zinc-200",
              ].join(" ")}
            >
              <span className="font-medium">{opt}</span>
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  active ? "bg-emerald-400" : "bg-zinc-600",
                ].join(" ")}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

