'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bot, Loader2, Sparkles, X } from 'lucide-react';
import { TypewriterText } from '@/components/copilot/typewriter-text';
import {
  mockCopilotProvider,
  type CopilotAnswer,
  type CopilotContext,
  type CopilotQuery,
} from '@/lib/ai/copilot-provider';
import { cn } from '@/lib/utils';

interface CopilotSidebarProps {
  open: boolean;
  onClose: () => void;
  context: CopilotContext;
}

export function CopilotSidebar({ open, onClose, context }: CopilotSidebarProps) {
  const [queries, setQueries] = useState<CopilotQuery[]>([]);
  const [answer, setAnswer] = useState<CopilotAnswer | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const contextKey = `${context.activeHref ?? ''}:${context.sectionLabel ?? ''}:${context.sectionTitle ?? ''}`;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    mockCopilotProvider.list(context).then((items) => {
      if (!cancelled) setQueries(items);
    });

    return () => {
      cancelled = true;
    };
  }, [context, contextKey, open]);

  useEffect(() => {
    if (open) return;
    setAnswer(null);
    setActiveId(null);
    setLoading(false);
  }, [open]);

  async function handleAsk(queryId: string) {
    setActiveId(queryId);
    setLoading(true);
    const nextAnswer = await mockCopilotProvider.answer(queryId, context);
    setAnswer(nextAnswer);
    setLoading(false);
  }

  const activeLabel = useMemo(
    () => queries.find((query) => query.id === activeId)?.labelCs ?? answer?.labelCs,
    [activeId, answer?.labelCs, queries],
  );

  return (
    <>
      <div
        className={cn(
          'print-hidden fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-[1px] transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        aria-label="AI Copilot"
        className={cn(
          'print-hidden fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[460px] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-200 sm:w-[460px]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="border-b border-zinc-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                Demo Copilot
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-normal text-zinc-950">
                {context.sectionTitle ?? 'HR Overview'}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {context.sectionLabel ?? 'Kontext'} · předpřipravené odpovědi
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
              aria-label="Zavřít Copilot"
              title="Zavřít"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Doporučené dotazy</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {queries.map((query) => (
                <button
                  key={query.id}
                  type="button"
                  onClick={() => void handleAsk(query.id)}
                  className={cn(
                    'rounded-full border px-3 py-2 text-left text-sm font-medium transition',
                    activeId === query.id
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800',
                  )}
                >
                  {query.labelCs}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-700 p-2 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">{activeLabel ?? 'Vyberte dotaz'}</p>
                <p className="text-xs text-zinc-500">Mock odpověď pro prezentační prototyp</p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-zinc-200 bg-white p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Připravuji odpověď
                </div>
              ) : answer ? (
                <TypewriterText
                  key={answer.queryId}
                  text={answer.answerMarkdownCs}
                  render={(visibleText) => <MarkdownContent markdown={visibleText} />}
                />
              ) : (
                <p className="text-sm leading-6 text-zinc-600">
                  Copilot ukáže, jak by finální BI mohlo odpovídat na otázky HR vedení. Vyberte jeden z dotazů.
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="border-t border-zinc-200 px-5 py-4">
          <p className="text-xs leading-5 text-zinc-500">
            Demo odpovědi jsou předpřipravené, bez live AI volání. Slouží jako ukázka cílového rozhodovacího zážitku.
          </p>
        </footer>
      </aside>
    </>
  );
}

function MarkdownContent({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="space-y-4 text-sm leading-6 text-zinc-700">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={`${index}-${trimmed}`} className="text-base font-semibold text-zinc-950">
              {renderInline(trimmed.replace(/^### /, ''))}
            </h3>
          );
        }

        if (trimmed.startsWith('- ')) {
          const items = trimmed
            .split('\n')
            .map((line) => line.replace(/^- /, '').trim())
            .filter(Boolean);

          return (
            <ul key={`${index}-${trimmed}`} className="space-y-2">
              {items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${index}-${trimmed}`}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    const [raw, label, href] = match;
    if (!label || !href) continue;

    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    nodes.push(
      <Link
        key={`${href}-${match.index}`}
        href={href}
        className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
      >
        {label}
        <ArrowUpRight className="h-3 w-3" />
      </Link>,
    );
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
