import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '박제맵 — 여기 내 마음 박제함',
  description: '지도 위에 자물쇠 박제하고 마음 잠그는 곳 🔒💖',
};

export const viewport: Viewport = {
  themeColor: '#0B0B14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const naverKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID ?? '';
  return (
    <html lang="ko">
      <head>
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverKeyId}&submodules=geocoder`}
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
