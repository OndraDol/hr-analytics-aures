import { Sparkles } from 'lucide-react';

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <section className="rounded-lg border border-violet-200 bg-violet-50 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-violet-600 p-2 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-violet-950">AI Executive Summary</h2>
          <p className="text-sm text-violet-700">pre-written demo insight nad deterministickými KPI</p>
        </div>
      </div>
      <p className="mt-5 font-serif text-xl italic leading-8 text-violet-950">{summary}</p>
    </section>
  );
}
