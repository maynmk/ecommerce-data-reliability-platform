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
    <div className="min-h-screen bg-zinc-50">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-semibold text-zinc-900">
                  {title}
                </div>
                <div className="text-xs leading-5 text-zinc-600">{subtitle}</div>
              </div>
              <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 md:flex">
                {badges.map((b) => (
                  <Badge key={b}>{b}</Badge>
                ))}
              </div>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1">
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
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

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-zinc-500">
          Fonte: schema <span className="font-mono">gold</span> via FastAPI •
          Endpoints <span className="font-mono">/metrics/*</span>
        </div>
      </footer>
    </div>
  );
}
