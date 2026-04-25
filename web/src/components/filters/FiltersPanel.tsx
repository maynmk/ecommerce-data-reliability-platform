"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function truncateId(value: unknown): string {
  const text = String(value ?? "");
  if (text.length <= 14) return text;
  return `${text.slice(0, 8)}…${text.slice(-4)}`;
}

export type SellerOption = {
  seller_id: string;
  alias: string;
  seller_state: string;
  seller_id_trunc: string;
};

export type StatusOption = { value: string; label: string; note?: string };

function fieldClasses(): string {
  return [
    "w-full rounded-xl border border-emerald-500/15 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100",
    "outline-none focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/10",
  ].join(" ");
}

function labelClasses(): string {
  return "text-xs font-semibold uppercase tracking-wide text-zinc-300";
}

function helpClasses(): string {
  return "text-xs leading-5 text-zinc-400";
}

export function FiltersPanel({
  states,
  categories,
  sellers,
  statuses,
  onRequestClose,
}: {
  states: string[];
  categories: string[];
  sellers: SellerOption[];
  statuses: StatusOption[];
  onRequestClose?: (() => void) | undefined;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [periodStart, setPeriodStart] = React.useState(searchParams.get("start") ?? "");
  const [periodEnd, setPeriodEnd] = React.useState(searchParams.get("end") ?? "");
  const [state, setState] = React.useState(searchParams.get("state") ?? "");
  const [category, setCategory] = React.useState(searchParams.get("category") ?? "");
  const [seller, setSeller] = React.useState(searchParams.get("seller") ?? "");
  const [status, setStatus] = React.useState(searchParams.get("status") ?? "");

  const selectedSellerMeta = React.useMemo(() => {
    if (!seller) return null;
    return sellers.find((s) => s.seller_id === seller) ?? null;
  }, [seller, sellers]);

  const updateUrl = (next: {
    start?: string;
    end?: string;
    state?: string;
    category?: string;
    seller?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key: string, value: string | undefined) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    };

    setOrDelete("start", next.start);
    setOrDelete("end", next.end);
    setOrDelete("state", next.state);
    setOrDelete("category", next.category);
    setOrDelete("seller", next.seller);
    setOrDelete("status", next.status);

    const hash = typeof window === "undefined" ? "" : window.location.hash;
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`);
  };

  const onApply = () => {
    updateUrl({
      start: periodStart || undefined,
      end: periodEnd || undefined,
      state: state || undefined,
      category: category || undefined,
      seller: seller || undefined,
      status: status || undefined,
    });
    onRequestClose?.();
  };

  const onClear = () => {
    setPeriodStart("");
    setPeriodEnd("");
    setState("");
    setCategory("");
    setSeller("");
    setStatus("");
    updateUrl({});
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-zinc-100">Filtros</div>
        <div className={helpClasses()}>
          Aplica filtros no frontend sempre que os dados agregados permitirem. Alguns
          filtros ficam como preparação para uma futura API com query params.
        </div>
      </div>

      <div className="space-y-2">
        <div className={labelClasses()}>Período</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">De</div>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className={fieldClasses()}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Até</div>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className={fieldClasses()}
            />
          </div>
        </div>
        <div className={helpClasses()}>Filtra as séries de vendas e o gráfico.</div>
      </div>

      <div className="space-y-2">
        <div className={labelClasses()}>Estado do cliente</div>
        <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClasses()}>
          <option value="">Todos</option>
          {states.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
        <div className={helpClasses()}>
          Funcional em entregas (e pode refinar rankings por UF quando aplicável).
        </div>
      </div>

      <div className="space-y-2">
        <div className={labelClasses()}>Categoria do produto</div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldClasses()}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className={helpClasses()}>Funcional na seção de produtos/categorias.</div>
      </div>

      <div className="space-y-2">
        <div className={labelClasses()}>Vendedor</div>
        <select value={seller} onChange={(e) => setSeller(e.target.value)} className={fieldClasses()}>
          <option value="">Todos</option>
          {sellers.map((s) => (
            <option key={s.seller_id} value={s.seller_id}>
              {s.alias}
            </option>
          ))}
        </select>
        <div className={helpClasses()}>
          {selectedSellerMeta ? (
            <>
              Seller ID (rastreabilidade):{" "}
              <span className="font-mono text-zinc-200" title={selectedSellerMeta.seller_id}>
                {selectedSellerMeta.seller_id_trunc || truncateId(selectedSellerMeta.seller_id)}
              </span>
            </>
          ) : (
            "Exibe alias amigável na interface; o seller_id original fica apenas para rastreabilidade."
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={labelClasses()}>Status do pedido</div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClasses()}>
          <option value="">Todos</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className={helpClasses()}>
          Este filtro é principalmente preparação; os marts atuais não permitem recalcular
          todos os KPIs por status sem suporte adicional na API.
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-xl border border-emerald-500/15 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-emerald-500/30 hover:bg-emerald-500/10"
        >
          Limpar filtros
        </button>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 hover:border-emerald-500/40 hover:bg-emerald-500/20"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}
