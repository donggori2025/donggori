# 동고리(DONGGORI) 프로젝트 인수인계 문서

> **문서 버전:** 2026-06-29 (정리본)  
> **대상:** 개발 위탁 업체  
> **저장소:** GitHub `donggori2025/donggori` (main 브랜치)  
> **운영 URL:** https://www.donggori.com

---

## 문서 목록

| 번호 | 문서 | PDF |
|------|------|-----|
| 01 | [개발 산출물](./01-개발-산출물.md) | [PDF](./pdf/01-개발-산출물.pdf) |
| 02 | [DB 스키마](./02-DB-스키마.md) | [PDF](./pdf/02-DB-스키마.pdf) |
| 03 | [API 문서](./03-API-문서.md) | [PDF](./pdf/03-API-문서.pdf) |
| 04 | [설치·배포 가이드](./04-설치-배포-가이드.md) | [PDF](./pdf/04-설치-배포-가이드.pdf) |
| 05 | [환경·인프라](./05-환경-인프라.md) | [PDF](./pdf/05-환경-인프라.pdf) |
| 06 | [인수인계 추가 사항](./06-인수인계-추가-사항.md) | [PDF](./pdf/06-인수인계-추가-사항.pdf) |
| 07 | [프로젝트 구조·스크립트](./07-프로젝트-구조-스크립트.md) | [PDF](./pdf/07-프로젝트-구조-스크립트.pdf) |
| 08 | [계정 정보](./08-계정-정보.md) | [PDF](./pdf/08-계정-정보.pdf) |
| — | [`.env.example`](./.env.example) | — |

> PDF는 Chrome headless 기반으로 생성됩니다. 재생성: `npm run handover:pdf`

---

## 기존 참고 문서 (`docs/`)

| 파일 | 설명 |
|------|------|
| `functional-spec.md` | 기능 정의서 |
| `db-migration-sql.md` | 세션/OTP/메시지 로그 SQL |
| `deployment-oauth-setup.md` | OAuth 배포 설정 |
| `session-management-guide.md` | 세션 관리 |
| `email-auth-setup-guide.md` | 이메일 OTP (SendGrid) |
| `naver-maps-setup.md` | 네이버 지도 설정 |
| `동고리-결과보고서-초안.md` | 사업 결과 보고서 |

---

## 인수인계 체크리스트

### 전달 필수 항목

- [x] Git 저장소 전체 소스 (최신 main)
- [ ] Supabase 프로젝트 Owner 권한 이전
- [ ] Vercel 프로젝트 Owner 권한 이전
- [ ] Vercel Blob 스토리지 접근 권한
- [ ] 도메인(DNS) 관리 권한
- [ ] OAuth 앱(카카오/네이버) 관리자 권한
- [ ] SendGrid / NCP SENS 계정 (운영 시)
- [ ] 환경 변수 실제 값 (별도 보안 채널)
- [ ] 최신 DB 백업
- [ ] 계정 정보 전달 ([08-계정-정보.md](./08-계정-정보.md) — **비밀번호 포함, 보안 채널 권장**)

### 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트/백엔드 | Next.js 15, React 19, TypeScript |
| DB | Supabase PostgreSQL (`@supabase/supabase-js`) |
| ORM | Prisma 6 (스키마 참고용) |
| 스타일 | Tailwind CSS 4 |
| 이미지 | Vercel Blob |
| 배포 | Vercel |
| 인증 | 커스텀 쿠키 세션 (카카오·네이버·이메일) |

### 정리 완료 사항 (2026-06-29)

- 도메인 통일: `www.donggori.com` (`.kr` → `.com` 리다이렉트)
- Clerk 레거시 코드·문서 삭제
- 토스페이먼츠 SDK 삭제
- 미사용 기능 삭제: 강좌, AI 모델핏/의류생성, 디버그 페이지, Google OAuth(Clerk) 경로

---

## 운영 시 확인

1. 관리자: `/admin/login` — `ADMIN_ID`, `ADMIN_PW`, `ADMIN_SESSION_SECRET`
2. `NEXT_PUBLIC_SITE_URL=https://www.donggori.com` (Vercel Production)
3. 크론/스케줄러 없음 — 데이터 작업은 `scripts/` 수동 실행
