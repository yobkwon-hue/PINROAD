'use client';

import { useEffect, useState } from 'react';
import { Lock, VISIBILITY_META } from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';
import { supabase } from '@/lib/supabase';
import { getAnonymousUserId } from '@/lib/anonymous-user';

interface LockModalProps {
  lock: Lock | null;
  onClose: () => void;
}

export default function LockModal({ lock, onClose }: LockModalProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!lock) return;
    let cancelled = false;
    const uid = getAnonymousUserId();
    (async () => {
      const { data: rows, count } = await supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('lock_id', lock.id);
      if (cancelled) return;
      setLikeCount(count ?? rows?.length ?? 0);
      setLiked(!!rows?.find((r) => r.user_id === uid));
    })();
    return () => {
      cancelled = true;
    };
  }, [lock]);

  if (!lock) return null;

  const meta = VISIBILITY_META[lock.visibility];
  const svg = buildLockSvg(lock.color, lock.shape, 120);
  const date = new Date(lock.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    const uid = getAnonymousUserId();
    try {
      if (liked) {
        await supabase.from('likes').delete().eq('lock_id', lock.id).eq('user_id', uid);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await supabase.from('likes').insert({ lock_id: lock.id, user_id: uid });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="sticker-lg relative w-full max-w-md animate-pop-in bg-white p-6 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="sticker-btn absolute -top-3 -right-3 h-10 w-10 !rounded-full !p-0 bg-white text-lg"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* lock */}
        <div className="relative mb-4 flex justify-center">
          <div
            className="bg-holo absolute inset-x-8 top-12 -z-0 h-20 rounded-full opacity-60 blur-2xl"
            aria-hidden
          />
          <div className="relative" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        {/* badge */}
        <div className="mb-3 flex justify-center gap-1.5">
          <span className={`chip ${meta.pill}`}>
            <span>{meta.icon}</span>
            <span>{meta.tag}</span>
          </span>
        </div>

        {/* title + body */}
        <h2 className="text-center font-display text-3xl leading-tight text-black">
          {lock.title}
        </h2>
        <p className="mt-3 whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-black/80">
          {lock.body}
        </p>

        <div className="mt-5 flex flex-col items-center gap-1 border-t-2 border-dashed border-black/30 pt-4 text-xs font-bold text-black/55">
          {lock.location_name && <span>📍 {lock.location_name}</span>}
          <span>{date}</span>
        </div>

        {/* like */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={toggleLike}
            disabled={busy}
            className={`sticker-btn ${
              liked ? 'bg-cyber-pink text-white' : 'bg-white text-black'
            }`}
          >
            <span className={liked ? 'animate-sparkle' : ''}>💖</span>
            <span>찐 {likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
