'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { AuresMonogram } from '@/components/layout/aures-monogram';

const STORAGE_KEY = 'aures-hr-overview-unlocked';
const PASSWORD = 'AURESHR12345';

export function PasswordGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'true') {
        setUnlocked(true);
      }
    } catch {
      // SSR / disabled storage
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (input === PASSWORD) {
      try {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#f6f7fb]" aria-hidden />;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aures-blue-950 via-aures-blue-900 to-aures-graphite-900 px-5 py-12 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="rounded-2xl border border-aures-blue-800/60 bg-aures-blue-900/40 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <AuresMonogram />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aures-blue-200">AURES Holdings</p>
              <p className="mt-1 text-xl font-semibold text-white">HR Overview</p>
            </div>
          </div>
          <h1 className="mt-8 font-serif text-3xl font-semibold leading-tight text-white">
            Demo přístup je chráněný heslem.
          </h1>
          <p className="mt-3 text-sm leading-6 text-aures-blue-100/80">
            Tato verze je sdílena pouze s vybranými lidmi v AURES. Zadejte heslo z pozvánky a otevře se vám celý prototyp.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-aures-blue-200">Heslo</span>
              <input
                type="password"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                autoComplete="off"
                placeholder="••••••••••"
                className="mt-2 w-full rounded-md border border-aures-blue-700 bg-aures-blue-950/80 px-3 py-2 text-base text-white placeholder:text-aures-blue-400/60 focus:border-aures-orange-400 focus:outline-none focus:ring-2 focus:ring-aures-orange-400/40"
              />
            </label>
            {error ? (
              <p className="text-sm text-rose-300">Heslo nesedí. Zkuste to znovu.</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-aures-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-aures-orange-600"
            >
              <Lock className="h-4 w-4" />
              Odemknout
            </button>
          </form>
          <p className="mt-6 text-[11px] leading-5 text-aures-blue-200/60">
            Přístup je čistě klientská kontrola pro demo prostředí. Pro produkční nasazení doplníme reálnou autentizaci.
          </p>
        </div>
      </div>
    </div>
  );
}
