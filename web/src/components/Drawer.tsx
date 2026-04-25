"use client";

import * as React from "react";

export function Drawer({
  open,
  title,
  children,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onOpenChange: (next: boolean) => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Fechar filtros"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-emerald-500/15 bg-zinc-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/10 px-5 py-4">
          <div className="text-sm font-semibold text-zinc-100">{title}</div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-emerald-500/15 bg-zinc-950/40 px-2 py-1 text-xs font-semibold text-zinc-200 hover:border-emerald-500/30 hover:bg-emerald-500/10"
          >
            Fechar
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

