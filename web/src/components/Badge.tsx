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
      ? "border-zinc-900/10 bg-zinc-900 text-white"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : tone === "danger"
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-zinc-200 bg-white text-zinc-700";

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

