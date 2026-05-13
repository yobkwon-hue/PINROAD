'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import LockModal from '@/components/LockModal';
import CreateLockFlow from '@/components/CreateLockFlow';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function HomePage() {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [selected, setSelected] = useState<Lock | null>(null);
  const [creating, setCreating] = useState(false);
  const [center, setCenter] = useState({ lat: 37.5512, lng: 126.9882 });
  const [loaded, setLoaded] = useState(false);

  async function fetchLocks() {
    const { data, error } = await supabase
      .from('locks')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!error && data) setLocks(data as Lock[]);
    setLoaded(true);
  }

  useEffect(() => {
    fetchLocks();
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <MapView
        locks={locks}
        onPinClick={setSelected}
        initialCenter={center}
        className="absolute inset-0"
      />

      {/* Top veil for contrast with map */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-space-deep/85 via-space-deep/40 to-transparent"
      />

      {/* TOP BAR */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="glass-card flex shrink-0 items-center gap-2 px-3 py-2.5 transition-transform hover:-translate-y-0.5"
          >
            <span className="text-base">🔒</span>
            <span className="font-display text-base tracking-widest text-white">
              BAKJE MAP
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <SearchBar onResult={(lat, lng) => setCenter({ lat, lng })} />
          </div>

          <Link
            href="/my"
            className="glass-card flex shrink-0 items-center justify-center px-3 py-2.5 transition-transform hover:-translate-y-0.5"
            aria-label="내 박제 보기"
          >
            <span className="text-base">👤</span>
          </Link>
        </div>
      </div>

      {/* EMPTY STATE */}
      {loaded && locks.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-4 sm:top-28">
          <div className="glass-card pointer-events-auto max-w-sm px-6 py-5 text-center animate-pop-in">
            <div className="mb-1 inline-block text-5xl animate-wiggle">🔒</div>
            <div className="font-display text-2xl leading-tight tracking-wide text-white">
              아직 박제 0개
            </div>
            <div className="mt-1.5 text-sm text-white/65">
              1빠로 박제해 ㄱㄱ ✨
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold tracking-widest text-lock-violet-light">
              ↓ 박제하기 버튼을 눌러보세요
            </div>
          </div>
        </div>
      )}

      {/* Counter chip above FAB */}
      {loaded && locks.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
          <div className="glass-chip text-white/85">
            <span>📍</span>
            <span className="font-extrabold text-white">{locks.length}</span>
            <span className="text-white/60">개의 마음</span>
          </div>
        </div>
      )}

      {/* Loading chip (mutually exclusive with counter) */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
          <div className="glass-chip text-white/70">불러오는 중...</div>
        </div>
      )}

      {/* FAB - bottom center pill */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex justify-center px-4">
        <div className="pointer-events-auto relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-lock-violet opacity-50 blur-2xl"
          />
          <button
            onClick={() => setCreating(true)}
            className="pill-btn relative animate-pop-in"
            aria-label="자물쇠 박제하기"
          >
            <span className="text-lg leading-none">＋</span>
            <span>자물쇠 박제하기</span>
          </button>
        </div>
      </div>

      <LockModal lock={selected} onClose={() => setSelected(null)} />
      {creating && (
        <CreateLockFlow
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            fetchLocks();
          }}
        />
      )}
    </div>
  );
}
