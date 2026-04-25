import * as React from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : tone === "success"
        ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
          ? "border-amber-500/35 bg-amber-500/10 text-amber-200"
          : tone === "danger"
            ? "border-rose-500/35 bg-rose-500/10 text-rose-200"
            : "border-emerald-500/15 bg-zinc-950/40 text-zinc-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClass,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
