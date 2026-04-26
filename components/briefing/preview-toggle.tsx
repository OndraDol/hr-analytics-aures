'use client';

import { Eye } from 'lucide-react';
import { useState } from 'react';

export function PreviewToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        document.documentElement.classList.toggle('briefing-preview-mode', next);
      }}
      className="print-hidden inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
    >
      <Eye className="h-4 w-4" />
      {enabled ? 'Vypnout náhled' : 'Náhled tisku'}
    </button>
  );
}
