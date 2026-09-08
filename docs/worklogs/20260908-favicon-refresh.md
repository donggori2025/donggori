# 검색용 새 로고 파비콘 — 2026-09-08

## 기준과 승인 범위

- 기준 main: `e5e2b8246748e9206e76306f039f0bb808bdfd5b` (PR #12).
- 시작 시 Production: `dpl_AAGeynUgeQfYByRVjyZ3MgcfkZQj`, Ready. 해당 main의 GitHub Vercel 성공 상태와 운영 도메인 배포 ID가 일치함.
- 작업 브랜치: `codex/favicon-refresh-20260908`.
- 사용자 승인: 첨부 새 로고의 왼쪽 심벌로 파비콘을 교체하고 검증 후 운영 배포. Search Console 색인 요청은 방법 안내이며 대신 제출하지 않음.
- 개발 가이드, Cursor 규칙, UI 선별 반영 기록, layout 메타데이터, 테스트, package/CI 설정을 먼저 확인함.

## 원인과 최소 변경

헤더의 `public/logo_donggori.svg`는 사용자 첨부 SVG와 이미 동일했다. 반면 `app/favicon.ico`와 `public/favicon.ico`는 이전 분홍색 로고의 1024×344 PNG를 `.ico` 이름으로 저장한 파일이었다. 운영 HTML도 이를 `sizes="1024x344"`로 안내하고 있었다. 따라서 Google 캐시뿐 아니라 실제 서버의 오래된 파비콘부터 교체해야 했다.

1. 기존 SVG의 왼쪽 심벌만 추출. 원본 로고 파일과 홈페이지 레이아웃은 변경하지 않음.
2. 기존 Sharp로 흰 배경·여백을 넣고 실제 ICO 컨테이너의 96/48/32/16px 정사각형 프레임을 생성. 의존성 추가 없음.
3. Next.js의 첫 프레임 크기 판독에 맞춰 96px을 첫 프레임으로 배치. 기존 `/favicon.ico` 경로와 파일 기반 metadata를 유지.
4. app/public 파일을 동일하게 교체. 221,589 → 12,423 bytes.
5. 기존 UI 회귀 테스트에 ICO 헤더·프레임 크기·브랜드 색·두 파일 일치 검사를 추가.

재생성: `node scripts/generate-favicon.mjs` (저장소 루트에서 실행).

새 ICO SHA-256: `c3fdf1ee15cb08cd8e9ec35f302adf00f0c2717cc081c91cdeb42aeb4c00804e`.

## 로컬 검증

- [x] 새 심벌 이미지를 렌더링하여 잘림·비율·배경 확인.
- [x] 보안 테스트 4/4, 기능/추천 5/5, UI 6/6.
- [x] `npm run verify`: typecheck/build 성공, 62개 페이지. 기존 lint 경고 421건, 오류 0건.
- [x] 빌드 HTML: `<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="96x96"/>`.
- [x] `git diff --check`.
- [x] auth/API/DB/runtime/dependency/CI 경로 변경 없음. 환경값 교체·다운로드 및 DB 쓰기 없음.

로컬 빌드에는 기존 CI의 공개 테스트 환경값을 프로세스에만 주입했다. 빌드 성공을 실제 OAuth/DB 인증 성공으로 취급하지 않는다. 이번 자산 변경에서는 실제 계정의 소셜 로그인 완료·문의 저장을 새로 실행하지 않는다.

## 배포 확인 계획과 복구

- Preview: 해당 HEAD의 Vercel Ready, 인증된 CLI로 홈페이지 아이콘 태그와 ICO 바이트 일치, 공개 공장 조회 확인. Preview 보호는 유지.
- 사용자 승인 범위 안에서 main merge 후 Production Ready, merge SHA와 배포 ID 연결, 운영 도메인 연결, 일반/Googlebot 요청의 홈페이지 및 파비콘 HTTP 200·동일 해시 확인.
- 실제 Preview/Production 배포 ID, SHA, smoke 결과는 이 변경의 PR 댓글에 후속 기록한다. 이 문서만으로 운영 배포 완료를 주장하지 않는다.
- 문제 시 이전 정상 배포 `dpl_AAGeynUgeQfYByRVjyZ3MgcfkZQj` / `e5e2b82`를 복구 기준으로 삼는다. DB 변경 없음.
- 브랜치 보호 및 기능 테스트 CI 연결은 기존 보류 결정 유지.

## 사용자 Search Console 작업

1. [Search Console](https://search.google.com/search-console)에서 `donggori.com` 도메인 속성 또는 `https://www.donggori.com/` URL 접두어 속성을 선택.
2. 상단 URL 검사에 `https://www.donggori.com/` 입력.
3. 실제 URL 테스트 후 색인 생성 요청. 이미 등록된 URL도 업데이트 요청 가능.
4. 요청 대상은 `/favicon.ico`가 아닌 홈페이지. 소유자 또는 전체 사용자 권한 필요.

색인 요청은 즉시 로고 변경이나 검색 표시를 보장하지 않는다. Google은 새 파비콘의 재크롤링·처리에 며칠~몇 주가 걸릴 수 있다고 안내한다.

- [Google 파비콘 가이드](https://developers.google.com/search/docs/appearance/favicon-in-search?hl=ko)
- [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko)
