'use client';

import { useState } from 'react';
import { Lock, VISIBILITY_META } from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';

interface LockCardProps {
  lock: Lock;
  onClick?: () => void;
}

export default function LockCard({ lock, onClick }: LockCardProps) {
  const [copied, setCopied] = useState(false);
  const svg = buildLockSvg(lock.color, lock.shape, 56);
  const meta = VISIBILITY_META[lock.visibility];
  const date = new Date(lock.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lock.share_token) return;
    const url = `${window.location.origin}/locks/${lock.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      onClick={onClick}
      className="sticker group block w-full bg-white p-4 text-left transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-sticker-lg"
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`chip ${meta.pill}`}>
              <span>{meta.icon}</span>
              <span>{meta.tag}</span>
            </span>
            {lock.visibility === 'link' && lock.share_token && (
              <button
                onClick={copyLink}
                className="chip bg-neon-yellow hover:bg-neon-lime"
                title="링크 복사"
              >
                {copied ? '복사됨 ✓' : '🔗 링크'}
              </button>
            )}
          </div>
          <h3 className="truncate text-base font-extrabold leading-tight text-black">
            {lock.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-black/70">{lock.body}</p>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-black/55">
            {lock.location_name && <span>📍 {lock.location_name}</span>}
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
