"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { formatDate } from "@/lib/format";
import type { StatusOption, SellerOption } from "@/components/filters/FiltersPanel";

function chipClasses(): string {
  return [
    "inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-zinc-950/40 px-3 py-1.5",
    "text-xs font-semibold text-zinc-200 hover:border-emerald-500/30 hover:bg-emerald-500/10",
  ].join(" ");
}

function closeButtonClasses(): string {
  return [
    "inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/15 bg-zinc-950/40",
    "text-[10px] text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10",
  ].join(" ");
}

export function ActiveFilterChips({
  sellerOptions,
  statuses,
}: {
  sellerOptions: SellerOption[];
  statuses: StatusOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = React.useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const state = params.get("state") ?? "";
  const category = params.get("category") ?? "";
  const seller = params.get("seller") ?? "";
  const status = params.get("status") ?? "";

  const sellerMeta = seller
    ? sellerOptions.find((s) => s.seller_id === seller) ?? null
    : null;

  const statusLabel = status
    ? statuses.find((s) => s.value === status)?.label ?? status
    : null;

  const hasAny = Boolean(start || end || state || category || seller || status);
  if (!hasAny) return null;

  const replace = (next: URLSearchParams) => {
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`);
  };

  const removeKeys = (keys: string[]) => {
    const next = new URLSearchParams(params.toString());
    for (const k of keys) next.delete(k);
    replace(next);
  };

  const clearAll = () => removeKeys(["start", "end", "state", "category", "seller", "status"]);

  const periodLabel =
    start || end
      ? `Período: ${start ? formatDate(start) : "—"} – ${end ? formatDate(end) : "—"}`
      : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Filtros ativos
      </div>

      {periodLabel ? (
        <button type="button" className={chipClasses()} onClick={() => removeKeys(["start", "end"])}>
          <span>{periodLabel}</span>
          <span className={closeButtonClasses()} aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}

      {state ? (
        <button type="button" className={chipClasses()} onClick={() => removeKeys(["state"])}>
          <span>Estado: {state}</span>
          <span className={closeButtonClasses()} aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}

      {category ? (
        <button type="button" className={chipClasses()} onClick={() => removeKeys(["category"])}>
          <span>Categoria: {category}</span>
          <span className={closeButtonClasses()} aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}

      {sellerMeta ? (
        <button
          type="button"
          className={chipClasses()}
          onClick={() => removeKeys(["seller"])}
          title={sellerMeta.seller_id_trunc}
        >
          <span>Vendedor: {sellerMeta.alias}</span>
          <span className={closeButtonClasses()} aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}

      {statusLabel ? (
        <button type="button" className={chipClasses()} onClick={() => removeKeys(["status"])}>
          <span>Status: {statusLabel}</span>
          <span className={closeButtonClasses()} aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={clearAll}
        className="ml-auto rounded-full border border-emerald-500/15 bg-zinc-950/40 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/30 hover:bg-emerald-500/10"
      >
        Limpar
      </button>
    </div>
  );
}

