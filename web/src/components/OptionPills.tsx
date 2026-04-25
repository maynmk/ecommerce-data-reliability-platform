import * as React from "react";

export type OptionPill = {
  id: string;
  label: string;
};

export function OptionPills({
  title,
  options,
  activeId,
  onChange,
}: {
  title: string;
  options: OptionPill[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-emerald-500/15 bg-zinc-950/25 p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-50">{title}</div>
      <div className="mt-3 grid flex-1 gap-2">
        {options.map((opt) => {
          const active = opt.id === activeId;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={[
                "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm outline-none transition-colors",
                "focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/10",
                active
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-100"
                  : "border-emerald-500/10 bg-zinc-950/20 text-zinc-200",
              ].join(" ")}
            >
              <span className="font-medium">{opt.label}</span>
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  active ? "bg-emerald-400" : "bg-zinc-600",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
