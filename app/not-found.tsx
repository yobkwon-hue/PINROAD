import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden p-6">
      <div
        className="bg-holo absolute inset-x-0 top-1/4 -z-0 h-72 opacity-30 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="sticker-lg bg-white p-6 text-center text-black animate-pop-in">
          <div className="font-display text-5xl leading-none text-holo">404</div>
          <div className="mt-3 font-display text-2xl">박제 못 찾음 🔒</div>
          <div className="mt-2 text-sm font-bold text-black/60">
            이 페이지는 존재하지 않거나 만료됐어요.
            <br />
            지도에서 다시 찾아보세요.
          </div>
          <Link
            href="/"
            className="sticker-btn mt-5 inline-flex bg-cyber-pink text-white"
          >
            지도로 ㄱㄱ →
          </Link>
        </div>
      </div>
    </div>
  );
}
