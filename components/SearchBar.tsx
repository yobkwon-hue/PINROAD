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
          className="flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-black placeholder:text-black/40 outline-none"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="bg-cyber-pink px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
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
