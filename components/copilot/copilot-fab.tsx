'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CopilotSidebar } from '@/components/copilot/copilot-sidebar';
import type { CopilotContext } from '@/lib/ai/copilot-provider';

export function CopilotFab({ context }: { context: CopilotContext }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="print-hidden fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        aria-label="Otevřít AI Copilot"
        title="AI Copilot"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      <CopilotSidebar open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}
