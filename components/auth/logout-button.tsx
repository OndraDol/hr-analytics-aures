'use client';

import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'aures-hr-overview-unlocked';

export function LogoutButton({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  function handleLogout() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition',
        variant === 'dark'
          ? 'border border-aures-blue-800 bg-aures-blue-900/40 text-aures-blue-100 hover:border-aures-orange-400 hover:bg-aures-blue-900 hover:text-white'
          : 'border border-zinc-200 bg-white text-zinc-700 hover:border-aures-blue-200 hover:bg-aures-blue-50 hover:text-aures-blue-800',
      )}
    >
      <LogOut className="h-3.5 w-3.5" />
      Odhlásit se
    </button>
  );
}
