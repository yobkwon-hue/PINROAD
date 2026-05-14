'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, LockVisibility, VISIBILITY_META } from '@/lib/types';
import { getAnonymousUserId } from '@/lib/anonymous-user';
import LockCard from '@/components/LockCard';
import LockModal from '@/components/LockModal';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

type Filter = 'all' | LockVisibility;
type ViewMode = 'list' | 'map';

export default function MyPage() {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<ViewMode>('list');
  const [selected, setSelected] = useState<Lock | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocks = () => {
    const uid = getAnonymousUserId();
    return supabase
      .rpc('get_my_locks', { p_user_id: uid })
      .then(({ data, error }) => {
        if (!error && data) setLocks(data as Lock[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocks();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? locks : locks.filter((l) => l.visibility === filter)),
    [filter, locks],
  );

  const counts = useMemo(() => {
    const c = { all: locks.length, public: 0, private: 0, link: 0 } as Record<Filter, number>;
    locks.forEach((l) => (c[l.visibility]++));
    return c;
  }, [locks]);

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'public', label: VISIBILITY_META.public.label },
    { key: 'private', label: VISIBILITY_META.private.label },
    { key: 'link', label: VISIBILITY_META.link.label },
  ];

  const emptyCopy: Record<Filter, { title: string; sub: string }> = {
    all: { title: '아직 박제 없음', sub: '첫 박제 ㄱㄱ ✨' },
    public: { title: '공개 박제 없음', sub: '지도에 1빠로 박제해보자' },
    private: { title: '비공개 박제 없음', sub: '나만 볼 시크릿 일기장 ㄱㄱ' },
    link: { title: '링크 박제 없음', sub: '둘만의 자물쇠 만들어볼래?' },
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b-2 border-black/40 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 p-3">
          <Link href="/" className="sticker-btn !py-2 !px-3 bg-white text-sm text-black">
            ←
          </Link>
          <h1 className="font-display text-2xl text-holo">내 박제</h1>
          <div className="ml-auto chip bg-cyber-pink">총 {locks.length}</div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-3 pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`sticker-btn !px-3 !py-1.5 shrink-0 text-xs ${
                filter === t.key ? 'bg-cyber-pink text-white' : 'bg-white text-black'
              }`}
            >
              {t.label} <span className="ml-1 opacity-70">{counts[t.key]}</span>
            </button>
          ))}
          <div className="ml-auto flex shrink-0 gap-1">
            <button
              onClick={() => setView('list')}
              className={`sticker-btn !px-3 !py-1.5 text-xs ${
                view === 'list' ? 'bg-cyber-blue text-black' : 'bg-white text-black'
              }`}
            >
              📋
            </button>
            <button
              onClick={() => setView('map')}
              className={`sticker-btn !px-3 !py-1.5 text-xs ${
                view === 'map' ? 'bg-cyber-blue text-black' : 'bg-white text-black'
              }`}
            >
              🗺
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mx-auto max-w-2xl space-y-3 p-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="sticker flex items-start gap-3 bg-white/10 p-4 animate-pulse"
            >
              <div className="h-14 w-14 shrink-0 rounded-xl bg-white/20" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-white/20" />
                <div className="h-4 w-2/3 rounded bg-white/20" />
                <div className="h-3 w-1/2 rounded bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto sticker inline-block bg-white p-6">
            <div className="font-display text-2xl text-black">{emptyCopy[filter].title}</div>
            <div className="mt-1 text-sm font-bold text-black/60">{emptyCopy[filter].sub}</div>
            <Link
              href="/"
              className="sticker-btn mt-4 inline-flex bg-cyber-pink text-white"
            >
              지도로 ㄱㄱ →
            </Link>
          </div>
        </div>
      ) : view === 'list' ? (
        <div className="mx-auto max-w-2xl space-y-3 p-3">
          {filtered.map((l) => (
            <LockCard key={l.id} lock={l} onClick={() => setSelected(l)} />
          ))}
        </div>
      ) : (
        <div className="relative h-[calc(100dvh-128px)]">
          <MapView
            locks={filtered}
            onPinClick={setSelected}
            className="absolute inset-0 z-0"
          />
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
    </div>
  );
}
