'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, VISIBILITY_META } from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';

export default function LinkLockPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [lock, setLock] = useState<Lock | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc('get_lock_by_token', { p_token: token })
      .then(({ data, error }) => {
        if (error || !data || (Array.isArray(data) && data.length === 0)) {
          setNotFound(true);
        } else {
          const row = Array.isArray(data) ? data[0] : data;
          setLock(row as Lock);
        }
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-white/60">
        박제 풀어보는 중...
      </div>
    );
  }
  if (notFound || !lock) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="sticker bg-white p-6 text-center">
          <div className="font-display text-2xl text-black">박제 못 찾음 ㅠ</div>
          <div className="mt-1 text-sm font-bold text-black/60">
            만료됐거나 잘못된 링크
          </div>
          <Link href="/" className="sticker-btn mt-4 inline-flex bg-cyber-pink text-white">
            지도로 ㄱㄱ
          </Link>
        </div>
      </div>
    );
  }

  const meta = VISIBILITY_META[lock.visibility];
  const svg = buildLockSvg(lock.color, lock.shape, 200);
  const date = new Date(lock.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden p-5">
      {/* Holo halo bg */}
      <div className="bg-holo absolute inset-x-0 top-1/4 -z-0 h-72 opacity-30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="sticker-lg bg-white p-6 text-black animate-pop-in">
          <div className="flex justify-center">
            <span className={`chip ${meta.pill}`}>
              <span>{meta.icon}</span>
              <span>{meta.tag}</span>
              <span>· 둘만의 자물쇠</span>
            </span>
          </div>

          <div className="my-5 flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>

          <h1 className="text-center font-display text-3xl leading-tight">
            {lock.title}
          </h1>
          <p className="mt-3 whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-black/80">
            {lock.body}
          </p>

          <div className="mt-5 flex flex-col items-center gap-1 border-t-2 border-dashed border-black/30 pt-4 text-xs font-bold text-black/55">
            {lock.location_name && <span>📍 {lock.location_name}</span>}
            <span>{date}</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="sticker-btn inline-flex bg-white text-sm text-black"
          >
            나도 박제하러 ㄱㄱ →
          </Link>
        </div>
      </div>
    </div>
  );
}
