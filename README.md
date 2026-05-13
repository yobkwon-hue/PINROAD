# 박제맵 (Bakje-map)

지도 위에 자물쇠를 박제하고 마음을 잠그는 곳 — Y2K 사이버팝 무드의 Z세대 지도 메시지 앱.

## 스택

- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL + RLS)
- 네이버 지도 API v3 (NCP)
- Tailwind CSS — Y2K cyberpop design system
- 익명 인증 (브라우저 localStorage UUID)

## 빠른 시작

```bash
npm install
cp .env.example .env.local
# .env.local 채우기 (아래 환경변수 섹션 참고)
# Supabase 콘솔에서 supabase/migrations/001_init.sql 실행
npm run dev
```

→ http://localhost:3000

## 환경변수

```
NEXT_PUBLIC_NAVER_MAP_KEY_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 네이버 지도 Client ID 발급

1. https://ncloud.com 가입 (개인 회원)
2. 결제 수단(카드) 등록 — 무료 쿼터만 써도 등록 필수
3. **콘솔 → Services → Application Services → Maps → 이용 신청**
4. **Application 등록**:
   - 이름: `박제맵`
   - Service: **Web Dynamic Map**, **Geocoding**, **Reverse Geocoding** 세 개 체크
   - Web 서비스 URL: `http://localhost` (포트 빼고!), 배포 후 `https://your-domain.vercel.app` 추가
5. 등록 후 **인증 정보**에서 **Client ID** 복사 → `NEXT_PUBLIC_NAVER_MAP_KEY_ID`에 붙여넣기

⚠️ Service URL은 호스트 도메인만 등록 (포트번호·경로 제외). `http://localhost:3000` 등록하면 401 인증 실패.

### Supabase

1. https://supabase.com 새 프로젝트 (서울 리전 권장)
2. **SQL Editor → New query** → `supabase/migrations/001_init.sql` 내용 붙여넣고 Run
3. **Settings → API**에서 `Project URL`, `anon public` 키 복사 → `.env.local`에 입력

## 폴더 구조

```
app/
  page.tsx               # 메인 지도 페이지
  my/page.tsx            # 내 박제 목록 (리스트/지도 토글)
  locks/[token]/page.tsx # 링크 공유 페이지
  layout.tsx             # Naver SDK 로딩
  globals.css            # Y2K 디자인 시스템 (holo, sticker, chip 등)
components/
  MapView.tsx            # 네이버 지도 래퍼
  CreateLockFlow.tsx     # 4-step 박제 플로우
  LockModal.tsx          # 자물쇠 상세 모달
  LockCard.tsx           # 박제 리스트 카드
  SearchBar.tsx          # 주소 검색 (Naver Service.geocode)
lib/
  types.ts               # Lock, LockColor, LockShape 등
  lockSvg.ts             # 플랫 스티커 자물쇠 SVG 생성기
  supabase.ts            # 클라이언트
  anonymous-user.ts      # localStorage UUID
supabase/
  migrations/001_init.sql  # 테이블 + RLS + RPC
tailwind.config.ts       # Y2K 컬러 토큰 (cyber-pink, cyber-blue, holo 등)
```

## RLS 설계 메모

익명 UUID 기반이라 `auth.uid()`가 없음. 그래서:

- **공개(public)**: 누구나 SELECT 가능
- **비공개(private)**: 직접 SELECT 차단, RPC `get_my_locks(p_user_id)`로만 조회 (SECURITY DEFINER)
- **링크(link)**: 직접 SELECT 차단, RPC `get_lock_by_token(p_token)`로만 조회

토큰·UUID 추측만으로는 다른 사람의 비공개·링크 자물쇠를 볼 수 없음.

## 영구성 정책

- 박제 후 **1분 안에만 삭제 가능** (DB 정책으로 강제)
- 1분 지나면 본인도 못 지움 — "한번 잠근 마음은 풀 수 없어요"

## 배포 (Vercel)

1. GitHub repo에 push
2. https://vercel.com → New Project → repo 선택
3. Environment Variables에 위 3개 입력 → Deploy
4. 배포된 도메인 (`xxx.vercel.app`)을 **NCP Application → Web 서비스 URL**에 추가
5. (선택) Vercel domains에서 커스텀 도메인 연결

## 트러블슈팅

- **지도 안 뜸 / 401 인증 실패**: NCP에서 Service URL을 `http://localhost` (포트 없이)로 등록했는지 확인. `http://localhost:3000`은 거부됨.
- **검색·역지오코딩 안 됨 / 429 에러**: NCP Application에서 **Geocoding** + **Reverse Geocoding** 체크했는지 확인. Web Dynamic Map만 켜면 둘 다 안 됨.
- **박제 실패 alert**: Supabase URL/키 오타거나 SQL 마이그레이션 실행 안 했음. 브라우저 콘솔에서 RLS 에러 확인.
- **`ncpKeyId` vs `ncpClientId`**: 2024년 12월 이후 신규 통합 콘솔 발급 키는 `ncpKeyId`를 써야 함 (이 프로젝트는 그쪽으로 설정됨). 옛날 콘솔 키 쓰면 `app/layout.tsx`에서 파라미터 이름만 바꿔주면 됨.
