'use client';

import { useEffect, useState } from 'react';
import { Lock, VISIBILITY_META } from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';
import { supabase } from '@/lib/supabase';
import { getAnonymousUserId } from '@/lib/anonymous-user';

interface LockModalProps {
  lock: Lock | null;
  onClose: () => void;
  onDeleted?: () => void;
}

const DELETE_WINDOW_SEC = 60;

export default function LockModal({ lock, onClose, onDeleted }: LockModalProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

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

  // Tick once per second while the modal is open so the delete countdown stays live.
  useEffect(() => {
    if (!lock) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [lock]);

  // Close on Esc — backdrop click already handles mouse dismiss.
  useEffect(() => {
    if (!lock) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lock, onClose]);

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

  const createdMs = new Date(lock.created_at).getTime();
  const ownedByMe = lock.user_id === getAnonymousUserId();
  const elapsedSec = Math.max(0, Math.floor((now - createdMs) / 1000));
  const remainingSec = Math.max(0, DELETE_WINDOW_SEC - elapsedSec);
  const canDelete = ownedByMe && remainingSec > 0;
  const countdownLabel = `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(
    remainingSec % 60,
  ).padStart(2, '0')}`;

  const shareUrl =
    lock.visibility === 'link' && lock.share_token && typeof window !== 'undefined'
      ? `${window.location.origin}/locks/${lock.share_token}`
      : null;

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('이 링크 복사해서 보내', shareUrl);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    if (!confirm('이 박제 진짜 지움? 못 돌림.')) return;
    setDeleting(true);
    const { error } = await supabase
      .from('locks')
      .delete()
      .eq('id', lock.id)
      .eq('user_id', getAnonymousUserId());
    setDeleting(false);
    if (error) {
      alert('삭제 실패 ㅠ');
      return;
    }
    onDeleted?.();
    onClose();
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

        {/* tagline */}
        <p className="mb-3 text-center font-display text-sm tracking-wide text-black/55">
          &ldquo;한번 잠근 마음은 풀 수 없어요.&rdquo;
        </p>

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

        {/* delete countdown / status */}
        {ownedByMe && (
          <div className="mt-4 sticker bg-bg-soft px-4 py-2.5 text-center">
            {canDelete ? (
              <>
                <div className="text-[10px] font-extrabold tracking-widest text-cyber-pink">
                  ⏳ 삭제 가능 시간
                </div>
                <div className="mt-0.5 font-display text-2xl tabular-nums text-white">
                  {countdownLabel}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-white/55">
                  박제 1분 안에만 지울 수 있음
                </div>
              </>
            ) : (
              <div className="text-xs font-extrabold text-white/70">
                🔒 1분 지났어요 — 영원히 박제됨
              </div>
            )}
          </div>
        )}

        {/* actions */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="sticker-btn bg-white text-sm text-black"
            >
              {deleting ? '지우는 중...' : '삭제하기'}
            </button>
          )}
          {shareUrl && (
            <button
              onClick={handleShare}
              className="sticker-btn bg-neon-yellow text-sm text-black"
            >
              {copied ? '복사됨 ✓' : '🔗 링크 복사'}
            </button>
          )}
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
