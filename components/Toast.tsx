'use client';

import { useEffect, useState } from 'react';

type ToastKind = 'info' | 'success' | 'error';
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

// Module-level pub/sub so anywhere in the app can call toast() without
// threading a context through every component.
let nextId = 1;
let toasts: ToastItem[] = [];
type Listener = (items: ToastItem[]) => void;
let listeners: Listener[] = [];

function emit() {
  for (const l of listeners) l(toasts);
}

const MAX_VISIBLE = 4;

export function toast(message: string, kind: ToastKind = 'info', ttlMs = 2500) {
  const id = nextId++;
  // Keep only the most recent N so a stuck loop or rapid-fire calls can't
  // flood the screen.
  toasts = [...toasts, { id, message, kind }].slice(-MAX_VISIBLE);
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, ttlMs);
}

const KIND_CLASS: Record<ToastKind, string> = {
  info: 'bg-bg-soft text-white',
  success: 'bg-cyber-pink text-white',
  error: 'bg-neon-yellow text-black',
};

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const l: Listener = (next) => setItems(next);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-28 left-1/2 z-[100] w-full max-w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 space-y-2 px-3">
      {items.map((t) => (
        <div
          key={t.id}
          className={`sticker pointer-events-auto px-4 py-2.5 text-sm font-extrabold animate-pop-in ${KIND_CLASS[t.kind]}`}
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
