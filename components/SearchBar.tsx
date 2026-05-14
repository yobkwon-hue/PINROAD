'use client';

import { useState } from 'react';

interface SearchBarProps {
  onResult: (lat: number, lng: number, name: string) => void;
}

export default function SearchBar({ onResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setErr(null);
    setSearching(true);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('accept-language', 'ko');
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data || data.length === 0) {
        setErr('결과 없음');
        return;
      }
      const r = data[0];
      onResult(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
    } catch {
      setErr('검색 실패 ㅠ');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSearch}
        className="sticker flex items-stretch overflow-hidden bg-white"
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setErr(null);
          }}
          placeholder="어디 박제할까? 🔍 (예: 홍대, 남산)"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-black placeholder:text-black/40 outline-none"
          aria-label="장소 검색"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setErr(null);
            }}
            className="shrink-0 px-2 text-base font-extrabold text-black/40 hover:text-black"
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="shrink-0 bg-cyber-pink px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
          style={{ borderLeft: '3px solid #000' }}
        >
          {searching ? '...' : 'GO'}
        </button>
      </form>
      {err && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10">
          <div className="chip bg-neon-yellow inline-block">{err}</div>
        </div>
      )}
    </div>
  );
}
