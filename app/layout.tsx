import './globals.css';
import 'leaflet/dist/leaflet.css';
import type { Metadata, Viewport } from 'next';

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
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
