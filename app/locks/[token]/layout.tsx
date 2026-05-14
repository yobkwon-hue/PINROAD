import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '둘만의 자물쇠',
  description: '링크로만 볼 수 있는 자물쇠 박제.',
  robots: { index: false, follow: false },
};

export default function LinkLockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
