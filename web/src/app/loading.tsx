export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-7 w-64 rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-96 rounded bg-zinc-200" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200" />
          ))}
        </div>
        <div className="mt-10 h-56 rounded-xl bg-zinc-200" />
      </div>
    </div>
  );
}

