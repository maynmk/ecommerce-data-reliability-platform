"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-xl font-semibold text-zinc-50">
          Falha ao carregar o dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Verifique se a API está rodando e se `NEXT_PUBLIC_API_URL` aponta para o
          host correto.
        </p>
        <pre className="mt-4 overflow-auto rounded-2xl border border-emerald-500/15 bg-zinc-950/30 p-4 text-xs text-zinc-200">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-500/40 hover:bg-emerald-500/20"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
