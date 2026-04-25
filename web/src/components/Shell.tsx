"use client";

import * as React from "react";
import { useMemo, useSyncExternalStore } from "react";

import { Badge } from "@/components/Badge";

export type NavItem = { id: string; label: string };

function normalizeHash(value: string): string {
  return value.replace(/^#/, "").trim();
}

export function Shell({
  title,
  subtitle,
  badges,
  nav,
  top,
  panels,
  onFilterClick,
  filterCount,
  children,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  badges: readonly string[];
  nav: readonly NavItem[];
  top?: React.ReactNode;
  panels?: ReadonlyArray<{ id: string; content: React.ReactNode }>;
  onFilterClick?: (() => void) | undefined;
  filterCount?: number | undefined;
  children?: React.ReactNode;
}) {
  const tabs = useMemo(() => nav.map((n) => n.id), [nav]);
  const defaultTab = tabs[0] ?? "overview";

  const activeId = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("hashchange", onStoreChange);
      return () => window.removeEventListener("hashchange", onStoreChange);
    },
    () => {
      const hash = normalizeHash(window.location.hash);
      return hash && tabs.includes(hash) ? hash : defaultTab;
    },
    () => defaultTab,
  );

  const setActive = (id: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(null, "", url.toString());
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  const panelMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    for (const p of panels ?? []) map.set(p.id, p.content);
    return map;
  }, [panels]);

  const renderContent =
    panels && panels.length > 0 ? panelMap.get(activeId) : (children ?? null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-emerald-500/15 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
                    Bem-vindo à
                  </div>
                  <div className="text-base font-semibold leading-tight text-zinc-50">
                    {title}
                  </div>
                  <div className="hidden text-sm leading-6 text-zinc-300 md:block">
                    {subtitle}
                  </div>
                </div>
              </div>
              <div className="shrink-0 items-center gap-2 flex">
                <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
                  {badges.map((b) => (
                    <Badge key={b}>{b}</Badge>
                  ))}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:border-emerald-500/40 hover:bg-emerald-500/15"
                  onClick={onFilterClick}
                  aria-haspopup="dialog"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      aria-hidden="true"
                      className="text-emerald-200"
                    >
                      <path
                        fill="currentColor"
                        d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6l-6.8 9.067V20a1 1 0 0 1-1.447.894l-3-1.5A1 1 0 0 1 9 18.5v-3.833L3.2 6.6A1 1 0 0 1 3 5Z"
                      />
                    </svg>
                  </span>
                  <span>Filtro</span>
                  {filterCount && filterCount > 0 ? (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1 text-[10px] font-bold text-emerald-200">
                      {filterCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            <nav
              className="-mx-1 flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Seções do dashboard"
            >
              {nav.map((item, idx) => {
                const selected = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(item.id)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                      e.preventDefault();
                      const delta = e.key === "ArrowRight" ? 1 : -1;
                      const next = (idx + delta + nav.length) % nav.length;
                      setActive(nav[next]!.id);
                    }}
                    className={[
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
                      selected
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                        : "border-emerald-500/15 bg-zinc-950/40 text-zinc-200 hover:border-emerald-500/30 hover:bg-emerald-500/10",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-14 pt-32 md:pt-28">
        {top ? <div className="space-y-6">{top}</div> : null}
        <div
          id={`panel-${activeId}`}
          role="tabpanel"
          aria-label={nav.find((n) => n.id === activeId)?.label ?? activeId}
        >
          {renderContent}
        </div>
      </main>

      <footer className="border-t border-emerald-500/10 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-zinc-400">
          Fonte: schema <span className="font-mono text-zinc-200">gold</span> via
          FastAPI • Endpoints{" "}
          <span className="font-mono text-zinc-200">/metrics/*</span>
        </div>
      </footer>
    </div>
  );
}
