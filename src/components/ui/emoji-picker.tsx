"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (emoji: string) => void;
  options: string[];
  label?: string;
}

export function EmojiPicker({ value, onChange, options, label }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-input bg-background/60 text-2xl hover:border-primary"
        aria-label={label ?? 'Escolher emoji'}
      >
        {value || '❓'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-14 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-3 shadow-xl">
            <div className="grid grid-cols-8 gap-1">
              {options.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onChange(e);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xl hover:bg-muted',
                    value === e && 'bg-primary/20 ring-1 ring-primary'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
