"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-xl font-semibold text-zinc-900">
          Falha ao carregar o dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Verifique se a API está rodando e se `NEXT_PUBLIC_API_URL` aponta para o
          host correto.
        </p>
        <pre className="mt-4 overflow-auto rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

