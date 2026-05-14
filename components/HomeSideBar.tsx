'use client';

import Link from 'next/link';
import { buildLockSvg } from '@/lib/lockSvg';

interface Props {
  count: number;
  onCreate: () => void;
}

const FEATURES: { icon: string; text: string }[] = [
  { icon: '🥸', text: '익명으로 안전하게' },
  { icon: '⏳', text: '1분 안에만 삭제' },
  { icon: '🔐', text: '공개 / 비공개 / 링크' },
  { icon: '✨', text: '우연을 기록' },
];

/**
 * Desktop-only floating sidebar that frames the map.
 * Hidden on mobile so the map can use the full viewport there.
 */
export default function HomeSideBar({ count, onCreate }: Props) {
  const heroSvg = buildLockSvg('pink', 'heart', 96);
  return (
    <aside className="pointer-events-none absolute bottom-5 left-3 top-32 z-20 hidden w-[260px] flex-col gap-3 lg:flex">
      {/* HERO CARD */}
      <div className="sticker-lg pointer-events-auto relative overflow-hidden bg-bg-soft p-4 text-center">
        <div className="font-display text-3xl leading-none text-holo">BAKJE</div>
        <div className="font-display text-3xl leading-none text-holo">MAP</div>
        <p className="mt-2 text-[11px] font-semibold text-white/75">
          자물쇠를 박제하고,
          <br />
          마음을 잠가요.
        </p>
        <div className="relative my-3 flex justify-center">
          <div
            className="bg-holo absolute inset-x-6 top-3 -z-0 h-16 rounded-full opacity-60 blur-2xl"
            aria-hidden
          />
          <div
            className="relative animate-pop-in"
            dangerouslySetInnerHTML={{ __html: heroSvg }}
          />
        </div>
        <div className="chip mx-auto bg-cyber-blue">📍 박제 {count}개</div>
        <button
          type="button"
          onClick={onCreate}
          className="sticker-btn mt-3 w-full bg-cyber-pink !py-2.5 text-sm text-white shadow-glow-pink"
        >
          <span>🔒</span>
          <span className="font-display tracking-wide">여기 박제</span>
        </button>
        <Link
          href="/my"
          className="sticker-btn mt-2 w-full bg-white !py-2 text-xs text-black"
        >
          내 자물쇠 보기
        </Link>
      </div>

      {/* ABOUT CARD */}
      <div className="sticker pointer-events-auto bg-bg-soft p-3">
        <div className="text-[10px] font-extrabold tracking-widest text-cyber-pink">
          BAKJE MAP?
        </div>
        <ul className="mt-2 space-y-1.5">
          {FEATURES.map((f) => (
            <li
              key={f.text}
              className="flex items-center gap-2 text-[11px] font-bold text-white/80"
            >
              <span className="shrink-0 text-base">{f.icon}</span>
              <span className="min-w-0">{f.text}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/welcome"
          className="mt-2 block text-center text-[10px] font-extrabold tracking-widest text-cyber-blue hover:text-cyber-pink"
        >
          더 알아보기 →
        </Link>
      </div>
    </aside>
  );
}
