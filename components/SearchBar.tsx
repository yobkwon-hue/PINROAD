'use client';

import { useState } from 'react';

interface SearchBarProps {
  onResult: (lat: number, lng: number, name: string) => void;
}

export default function SearchBar({ onResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || typeof window === 'undefined') return;
    if (!window.naver?.maps?.Service) {
      setErr('지도 SDK 아직 로딩중.. 잠시 후 다시');
      return;
    }
    setErr(null);
    setSearching(true);
    window.naver.maps.Service.geocode(
      { query },
      (status: any, response: any) => {
        setSearching(false);
        if (status !== window.naver.maps.Service.Status.OK) {
          setErr('못 찾음 ㅠ');
          return;
        }
        const items = response?.v2?.addresses;
        if (!items || items.length === 0) {
          setErr('결과 없음');
          return;
        }
        const r = items[0];
        const lat = parseFloat(r.y);
        const lng = parseFloat(r.x);
        const name = r.roadAddress || r.jibunAddress || query;
        onResult(lat, lng, name);
      },
    );
  };

  const trimmed = query.trim();

  return (
    <div className="relative">
      <form
        onSubmit={handleSearch}
        className="glass-card flex items-center gap-2 px-3 py-2"
      >
        <span
          aria-hidden
          className="shrink-0 select-none text-base leading-none text-white/55"
        >
          {searching ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            '🔍'
          )}
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setErr(null);
          }}
          placeholder="장소를 검색하세요 (예: 홍대, 남산)"
          className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/40 outline-none"
        />
        {trimmed && (
          <button
            type="submit"
            disabled={searching}
            className="shrink-0 rounded-full bg-lock-violet px-3 py-1 text-xs font-extrabold text-white shadow-glow-violet transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {searching ? '...' : '검색'}
          </button>
        )}
      </form>
      {err && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1.5 px-1">
          <div className="glass-chip inline-flex text-white">⚠️ {err}</div>
        </div>
      )}
    </div>
  );
}
