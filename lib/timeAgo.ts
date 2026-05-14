// Korean relative time formatter shared by /, /my, and any future
// surfaces that need "5분 전" style timestamps.
export function timeAgo(iso: string, now: number = Date.now()): string {
  const diffSec = (now - new Date(iso).getTime()) / 1000;
  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
