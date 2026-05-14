'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildLockSvg } from '@/lib/lockSvg';

const SEEN_KEY = 'bakje_seen_welcome';

const FEATURES: { icon: string; title: string; sub: string }[] = [
  {
    icon: '🥸',
    title: '익명으로 안전하게',
    sub: 'UUID 기반 익명 시스템. 누가 박제했는지 알 수 없음.',
  },
  {
    icon: '⏳',
    title: '1분 안에만 삭제 가능',
    sub: '신중하게 박제하세요. 1분 지나면 영원히 못 지움.',
  },
  {
    icon: '🔐',
    title: '다양한 자물쇠 종류',
    sub: '공개 / 비공개 / 링크 공유로 마음을 전해보세요.',
  },
  {
    icon: '✨',
    title: '우리의 우연을 기록해요',
    sub: '지도 위에 남겨진 마음들이 어딘가의 누군가에게 닿기를.',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const heroSvg = buildLockSvg('pink', 'heart', 220);

  const enter = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* private mode etc. — ignore */
      }
    }
    router.push('/');
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-10">
        {/* HERO */}
        <section
          className="sticker-lg relative overflow-hidden bg-bg-soft p-7 text-center animate-slide-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="font-display text-5xl leading-none text-holo">BAKJE</div>
          <div className="font-display text-5xl leading-none text-holo">MAP</div>
          <p className="mt-3 text-sm font-semibold text-white/75">
            자물쇠를 박제하고,
            <br />
            마음을 잠가요.
          </p>

          <div className="relative my-6 flex justify-center">
            <div
              className="bg-holo absolute inset-x-10 top-6 -z-0 h-32 rounded-full opacity-60 blur-3xl"
              aria-hidden
            />
            <div
              className="relative animate-pop-in"
              dangerouslySetInnerHTML={{ __html: heroSvg }}
            />
          </div>

          <button
            type="button"
            onClick={enter}
            className="sticker-btn w-full bg-cyber-pink !py-4 text-base text-white shadow-glow-pink"
          >
            <span className="text-lg">🗺️</span>
            <span className="font-display tracking-wide">지도로 시작하기</span>
          </button>

          <Link
            href="/my"
            onClick={() => {
              try {
                window.localStorage.setItem(SEEN_KEY, '1');
              } catch {
                /* ignore */
              }
            }}
            className="sticker-btn mt-3 w-full bg-white !py-3 text-sm text-black"
          >
            내 자물쇠 보기
          </Link>
        </section>

        {/* ABOUT */}
        <section
          className="sticker bg-bg-soft p-5 animate-slide-up"
          style={{ animationDelay: '220ms', animationFillMode: 'backwards' }}
        >
          <div className="text-[11px] font-extrabold tracking-widest text-cyber-pink">
            BAKJE MAP?
          </div>
          <p className="mt-1 text-sm font-medium text-white/75">
            우연히 마주쳤지만 고백하지 못했던 사람에게,
            <br />
            지도 위에 자물쇠로 마음을 박제해보세요.
            <br />
            한 번 잠근 마음은 풀 수 없어요.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="sticker bg-bg p-3 text-left animate-pop-in"
                style={{
                  animationDelay: `${340 + i * 90}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <div className="text-2xl leading-none">{f.icon}</div>
                <div className="mt-2 text-xs font-extrabold text-white">{f.title}</div>
                <div className="mt-1 text-[11px] font-medium leading-snug text-white/55">
                  {f.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center text-[10px] font-bold tracking-widest text-white/30">
          © BAKJE MAP v1
        </div>
      </main>
    </div>
  );
}
