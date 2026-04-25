import * as React from "react";

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={[
        "flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-zinc-950/35 p-4 shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      <div className="space-y-1">
        <div className="text-sm font-semibold text-zinc-50">{title}</div>
        {subtitle ? (
          <div className="text-xs leading-5 text-zinc-300">{subtitle}</div>
        ) : null}
      </div>
      <div className={["mt-4 min-h-[14rem] flex-1", bodyClassName ?? ""].join(" ")}>
        {children}
      </div>
    </div>
  );
}
