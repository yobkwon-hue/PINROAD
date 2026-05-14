import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '환영',
  description: '박제맵에 오신 걸 환영해요. 지도 위에 자물쇠를 박제하고 마음을 잠가요.',
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
