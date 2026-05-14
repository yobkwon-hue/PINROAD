# 박제맵 (Bakje-map)

지도 위에 자물쇠를 박제하고 마음을 잠그는 곳 — Y2K 사이버팝 무드의 Z세대 지도 메시지 앱.

## 주요 기능

- 🗺️ **다크 지도 + 컬러 자물쇠 핀** — Leaflet + CARTO Dark Matter
- 🔍 **장소 검색** — Nominatim 지오코딩, `/` 키로 빠른 포커스, ✕로 클리어
- 🔒 **3종 자물쇠** — 공개 / 비공개(나만) / 링크(둘만의)
- 📡 **현위치 점프** — 좌하단 버튼, 검색 결과로도 즉시 이동
- 🪧 **필터 칩** — 전체 / 공개 / 비공개 / 링크 즉시 토글
- 💖 **좋아요** — 익명 카운트
- 🗑️ **1분 삭제 윈도우** — 박제 직후 1분 내에만 본인 삭제 가능, 카운트다운 표시
- 🔗 **공유 링크** — 공개는 `/#lock-<id>` 해시 딥링크, 링크형은 `/locks/<token>`
- 📍 **최근 박제 패널** — 우하단, 클릭하면 지도 이동 + 강조
- ✨ **핀 강조 펄스** — 선택된 자물쇠 핑크 글로우 + 1.18배 펄스
- 🔔 **토스트 알림** — 모든 상태 피드백 (성공/실패/안내)
- ⏳ **임시 저장 (Draft)** — 박제 작성 중 닫아도 다음에 복원 (localStorage)
- ⌨️ **키보드 단축키** — `/` 검색, `n` 새 박제, `?` 도움말, `Esc` 닫기
- ♿ **접근성** — `prefers-reduced-motion`, focus-visible 외곽선, aria-label
- 📱 **모바일 대응** — 반응형 상단바, 모바일 첫 진입엔 최근 패널 접힘
- 🎉 **환영 화면** — 첫 방문 자동 안내 (`/welcome`), 도움말에서 다시 보기
- 📤 **JSON 내보내기** — `/my`에서 내 자물쇠 전체 백업
- 🌐 **PWA 기본** — favicon, manifest, 모바일 설치 가능
- 🚫 **404** — 디자인 일관성 있는 not-found 페이지

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
  page.tsx                  # 메인 지도 (필터 칩 · 최근 박제 패널 · 현위치 · FAB · 단축키 · 해시 딥링크)
  welcome/page.tsx          # 첫 진입 환영 화면 (localStorage 플래그 후 / 로 진입)
  my/page.tsx               # 내 박제 (리스트/지도 토글, 필터 인지 빈 상태, 정렬, JSON 내보내기)
  locks/[token]/page.tsx    # 링크 공유
  not-found.tsx             # 404
  layout.tsx                # Leaflet CSS + ToastHost + 메타데이터 (favicon, OG, manifest)
  globals.css               # Y2K 디자인 시스템 + Leaflet 컨트롤·툴팁 스타일 + a11y 미디어 쿼리
components/
  MapView.tsx               # Leaflet 래퍼 (다크 타일, 선택 핀 강조, 호버 툴팁)
  CreateLockFlow.tsx        # 4-step 박제 플로우 (localStorage draft 자동 저장)
  LockModal.tsx             # 자물쇠 상세 (인용구, 1분 삭제 카운트다운, 공유 링크, Esc)
  LockCard.tsx              # /my 리스트 카드 (timeAgo)
  SearchBar.tsx             # Nominatim 지오코딩 (/ 단축키, ✕ 클리어)
  Toast.tsx                 # 토스트 시스템 (모듈 pub/sub + ToastHost)
lib/
  types.ts
  lockSvg.ts                # 플랫 스티커 자물쇠 SVG
  supabase.ts
  anonymous-user.ts
  timeAgo.ts                # 한국어 상대 시간 (방금 전 / N분 전 / ...)
public/
  favicon.svg               # 홀로 그라데이션 자물쇠 (SVG)
  manifest.webmanifest      # PWA 매니페스트
  robots.txt
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
