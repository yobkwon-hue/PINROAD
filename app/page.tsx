'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, LockVisibility } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import LockModal from '@/components/LockModal';
import CreateLockFlow from '@/components/CreateLockFlow';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

type Filter = 'all' | LockVisibility;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'public', label: '공개' },
  { key: 'private', label: '비공개' },
  { key: 'link', label: '링크' },
];

export default function HomePage() {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [selected, setSelected] = useState<Lock | null>(null);
  const [creating, setCreating] = useState(false);
  const [center, setCenter] = useState({ lat: 37.5512, lng: 126.9882 });
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchLocks = useCallback(async () => {
    let q = supabase
      .from('locks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    q = filter === 'all' ? q.eq('visibility', 'public') : q.eq('visibility', filter);
    const { data, error } = await q;
    if (!error && data) setLocks(data as Lock[]);
    setLoaded(true);
  }, [filter]);

  useEffect(() => {
    fetchLocks();
  }, [fetchLocks]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <MapView
        locks={locks}
        onPinClick={setSelected}
        initialCenter={center}
        className="absolute inset-0 z-0"
      />

      {/* TOP BAR */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3">
        <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="sticker inline-flex shrink-0 items-center gap-2 bg-bg px-3 py-2 hover:-translate-y-0.5 transition-transform"
            >
              <span className="font-display text-2xl leading-none text-holo">박제맵</span>
              <span className="text-[10px] font-extrabold leading-none tracking-widest text-cyber-pink">
                v1
              </span>
            </Link>

            <div className="min-w-0 flex-1">
              <SearchBar onResult={(lat, lng) => setCenter({ lat, lng })} />
            </div>

            <button
              type="button"
              aria-label="알림"
              className="sticker shrink-0 bg-bg px-3 py-2 text-lg hover:-translate-y-0.5 transition-transform"
            >
              🔔
            </button>
            <Link
              href="/my"
              aria-label="내 박제"
              className="sticker shrink-0 bg-bg px-3 py-2 text-lg hover:-translate-y-0.5 transition-transform"
            >
              👤
            </Link>
          </div>

          {/* FILTER CHIPS */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = f.key === filter;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`chip transition-transform ${
                    active
                      ? 'bg-cyber-pink text-white'
                      : 'bg-bg-soft text-white/80 hover:-translate-y-0.5'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {loaded && locks.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-32 z-10 flex justify-center px-4">
          <div className="sticker pointer-events-auto bg-white px-5 py-4 text-center animate-pop-in">
            <div className="font-display text-xl text-black">아직 박제 0개</div>
            <div className="mt-1 text-xs font-bold text-black/65">
              1빠로 박제해 ㄱㄱ ✨
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setCreating(true)}
        className="sticker-btn fixed bottom-5 left-1/2 z-30 -translate-x-1/2 bg-cyber-pink !px-5 !py-4 text-base text-white shadow-glow-pink animate-pop-in"
        aria-label="자물쇠 박제"
      >
        <span className="text-xl">🔒</span>
        <span className="font-display tracking-wide">여기 박제</span>
      </button>

      {/* Bottom counter */}
      <div className="pointer-events-none absolute bottom-5 left-5 z-20">
        <div className="sticker bg-bg/90 px-3 py-1.5 text-[11px] font-extrabold tracking-widest text-cyber-blue">
          📍 박제 {locks.length}개
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
