export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-7 w-64 rounded bg-emerald-500/10" />
        <div className="mt-2 h-4 w-96 rounded bg-emerald-500/10" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-emerald-500/10" />
          ))}
        </div>
        <div className="mt-10 h-56 rounded-2xl bg-emerald-500/10" />
      </div>
    </div>
  );
}
