export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatNumber(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR").format(n);
}

export function formatCurrencyBRL(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCurrencyBRLCompact(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return "—";

  const abs = Math.abs(n);
  if (abs < 1_000) {
    return formatCurrencyBRL(n);
  }

  if (abs < 1_000_000) {
    const thousands = Math.round(n / 1_000);
    return `R$ ${new Intl.NumberFormat("pt-BR").format(thousands)} mil`;
  }

  if (abs < 1_000_000_000) {
    const millions = Number((n / 1_000_000).toFixed(1));
    const formatted = new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: Number.isInteger(millions) ? 0 : 1,
    }).format(millions);
    return `R$ ${formatted} mi`;
  }

  const billions = Number((n / 1_000_000_000).toFixed(1));
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(billions) ? 0 : 1,
  }).format(billions);
  return `R$ ${formatted} bi`;
}

export function formatPercent(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTime(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}
