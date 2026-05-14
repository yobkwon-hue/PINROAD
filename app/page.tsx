'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, LockVisibility } from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';
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

const SEEN_WELCOME_KEY = 'bakje_seen_welcome';

function timeAgo(iso: string): string {
  const diffSec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  return `${Math.floor(diffSec / 86400)}일 전`;
}

export default function HomePage() {
  const router = useRouter();
  const [locks, setLocks] = useState<Lock[]>([]);
  const [selected, setSelected] = useState<Lock | null>(null);
  const [creating, setCreating] = useState(false);
  const [center, setCenter] = useState({ lat: 37.5512, lng: 126.9882 });
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [recentOpen, setRecentOpen] = useState(true);

  // First-visit redirect to /welcome
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(SEEN_WELCOME_KEY)) {
        router.replace('/welcome');
      }
    } catch {
      /* private mode etc. — just stay on home */
    }
  }, [router]);

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

      {/* RECENT PANEL */}
      {locks.length > 0 && (
        <div className="pointer-events-none absolute bottom-24 right-3 z-20 w-[260px] max-w-[calc(100vw-1.5rem)]">
          {recentOpen ? (
            <div className="sticker pointer-events-auto bg-bg/95 p-3 animate-slide-up">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-extrabold tracking-widest text-cyber-pink">
                  📍 최근 박제
                </div>
                <button
                  onClick={() => setRecentOpen(false)}
                  className="text-sm text-white/55 hover:text-white"
                  aria-label="패널 닫기"
                >
                  ✕
                </button>
              </div>
              <ul className="mt-2 space-y-1.5">
                {locks.slice(0, 3).map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => {
                        setSelected(l);
                        setCenter({ lat: l.lat, lng: l.lng });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg border-2 border-black/30 bg-bg-soft px-2 py-1.5 text-left hover:border-cyber-pink/70"
                    >
                      <span
                        className="shrink-0"
                        dangerouslySetInnerHTML={{
                          __html: buildLockSvg(l.color, l.shape, 22),
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-white">
                          {l.location_name || `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`}
                        </span>
                        <span className="block text-[10px] font-bold text-white/50">
                          {timeAgo(l.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                href="/my"
                className="mt-2 block text-center text-[11px] font-extrabold tracking-widest text-cyber-blue hover:text-cyber-pink"
              >
                더 보기 →
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setRecentOpen(true)}
              className="sticker-btn pointer-events-auto bg-bg/95 !px-3 !py-2 text-xs text-cyber-pink"
            >
              📍 최근 박제
            </button>
          )}
        </div>
      )}

      <LockModal
        lock={selected}
        onClose={() => setSelected(null)}
        onDeleted={() => {
          setSelected(null);
          fetchLocks();
        }}
      />
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
