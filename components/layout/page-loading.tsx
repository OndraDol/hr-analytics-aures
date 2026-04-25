export function PageLoading({ label = 'Připravuji dashboard' }: { label?: string }) {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-6 md:px-8 lg:pl-72">
      <div className="max-w-6xl animate-pulse">
        <div className="h-4 w-48 rounded bg-zinc-200" />
        <div className="mt-4 h-10 w-full max-w-xl rounded bg-zinc-200" />
        <p className="mt-5 text-sm font-medium text-zinc-500">{label}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-72 rounded-lg border border-zinc-200 bg-white" />
          <div className="h-72 rounded-lg border border-zinc-200 bg-white" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-40 rounded-lg border border-zinc-200 bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
