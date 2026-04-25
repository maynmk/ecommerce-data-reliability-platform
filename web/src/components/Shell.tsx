import * as React from "react";

import { Badge } from "@/components/Badge";

export type NavItem = { id: string; label: string };

export function Shell({
  title,
  subtitle,
  badges,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  badges: readonly string[];
  nav: readonly NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-emerald-500/15 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-semibold text-zinc-50">{title}</div>
                <div className="text-xs leading-5 text-zinc-300">{subtitle}</div>
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
                  Filtros
                </button>
              </div>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1">
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 rounded-full border border-emerald-500/15 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-200 shadow-sm hover:border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-14 pt-32 md:pt-28">
        {children}
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
