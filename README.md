# 박제맵 (Bakje-map)

지도 위에 자물쇠를 박제하고 마음을 잠그는 곳 — Y2K 사이버팝 무드의 Z세대 지도 메시지 앱.

## 스택

- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL + RLS)
- **Leaflet + OpenStreetMap (CARTO Dark Matter 타일)** — API 키·가입 0
- **Nominatim** — 무료 지오코딩/역지오코딩 (OSM 공식)
- Tailwind CSS — Y2K cyberpop design system

## 빠른 시작

```bash
npm install
cp .env.example .env.local
# .env.local에 Supabase URL과 키 채우기 (지도용 키는 필요 없음!)
# Supabase 콘솔에서 supabase/migrations/001_init.sql 실행
npm run dev
```

→ http://localhost:3000

## 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**지도용 API 키는 필요 없습니다.** OpenStreetMap은 공개 데이터이고 CARTO 타일 서비스도 attribution만 표시하면 무료.

### Supabase 셋업

1. https://supabase.com 새 프로젝트 (서울 리전 권장)
2. **SQL Editor → New query** → `supabase/migrations/001_init.sql` 내용 붙여넣고 Run
3. **Settings → API**에서 Project URL, Publishable(anon) 키 복사 → `.env.local`

## Nominatim 사용 약관

검색·역지오코딩에 Nominatim 무료 공개 서버를 씁니다. 트래픽이 늘면 (초당 1회 초과) 자체 호스팅 또는 유료 서비스로 갈아탈 것 권장:
- **LocationIQ** (https://locationiq.com) — 무료 티어 1만 req/일
- **MapTiler** (https://maptiler.com) — 무료 티어 10만 req/월
- 또는 Nominatim 셀프 호스팅

박제맵 정도 트래픽에서는 공개 서버로 충분.

## 폴더 구조

```
app/
  page.tsx                  # 메인 지도 (필터 칩 · 최근 박제 패널 · 현위치 · FAB)
  welcome/page.tsx          # 첫 진입 환영 화면 (localStorage 플래그 후 / 로 진입)
  my/page.tsx               # 내 박제 (리스트/지도 토글, 필터 인지 빈 상태)
  locks/[token]/page.tsx    # 링크 공유
  layout.tsx                # Leaflet CSS 포함
  globals.css               # Y2K 디자인 시스템 + Leaflet 컨트롤 스타일
components/
  MapView.tsx               # Leaflet 래퍼 (다크 타일)
  CreateLockFlow.tsx        # 4-step 박제 플로우
  LockModal.tsx
  LockCard.tsx
  SearchBar.tsx             # Nominatim 지오코딩
lib/
  types.ts
  lockSvg.ts                # 플랫 스티커 자물쇠 SVG
  supabase.ts
  anonymous-user.ts
supabase/migrations/001_init.sql
tailwind.config.ts          # Y2K 컬러 토큰
```

## RLS 설계

익명 UUID 기반 — `auth.uid()` 없음:
- **public**: 누구나 SELECT
- **private**: RPC `get_my_locks(p_user_id)`로만 (SECURITY DEFINER)
- **link**: RPC `get_lock_by_token(p_token)`로만

## 영구성 정책

박제 후 1분 안에만 삭제 가능 (DB 정책으로 강제).

## 배포 (Vercel)

1. GitHub repo에 push
2. https://vercel.com → New Project → repo 선택
3. Environment Variables에 Supabase 두 값 입력 → Deploy
4. 끝. (지도 도메인 등록 같은 거 없음)

## 나중에 카카오/네이버로 교체하려면

`components/MapView.tsx`만 그쪽 SDK용으로 다시 짜고, `SearchBar.tsx`와 `CreateLockFlow.tsx`의 reverseGeocode 함수만 SDK 호출로 바꾸면 됩니다. 데이터 모델·디자인·라우트 전부 그대로.

## 트러블슈팅

- **지도 안 뜸**: 보통 안 그래요. 만약 뜨면 브라우저 콘솔에서 `*.cartocdn.com` 도메인 차단됐는지 확인 (광고차단 확장프로그램이 가끔 차단)
- **검색 안 됨**: Nominatim이 일시적으로 느릴 수 있음. 페이지 새로고침 후 재시도
- **박제 실패**: Supabase URL/키 오타거나 SQL 마이그레이션 실행 안 됨
