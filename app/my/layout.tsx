import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 박제',
  description: '내가 박제한 자물쇠들을 모아 볼 수 있어요.',
  robots: { index: false, follow: false },
};

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
