# 동고리 (DONGGORI)

봉제공장이 필요한 순간, 동고리

## 작업자가 먼저 읽을 문서

- [현재 main 기준 개발 절차·회귀 방지 가이드](docs/development-workflow.md)
- [Cursor에 붙여 넣을 작업 시작 프롬프트](docs/cursor-start-prompt.md)
- [UI 선별 반영 기록](docs/ui-safe-reapply-20260907.md)
- Cursor 프로젝트 규칙: `.cursor/rules/donggori-development.mdc`

과거 인수인계 자료보다 최신 main 코드·관련 테스트·위 가이드의 현재 계약을 먼저 확인합니다. 문서의 기준 SHA는 확인 시점 기록이며 작업마다 최신 main과 운영 배포를 다시 확인합니다.

## 시작하기

### 필수 요구사항

- Node.js 22 (현재 CI 기준) 및 npm
- Supabase (PostgreSQL)
- Vercel (프로덕션 배포)

### 설치 및 실행

```bash
npm ci
cp env.example .env.local
# .env.local 편집 후
npm run dev
```

프로덕션 URL: **https://www.donggori.com**

인수인계 문서: [`docs/handover/README.md`](docs/handover/README.md)

## OAuth 설정

- 네이버: `https://www.donggori.com/api/auth/naver/callback`
- 카카오: `https://www.donggori.com/api/auth/kakao/callback`

상세: `docs/deployment-oauth-setup.md`

## 로그인 방식

1. 네이버 OAuth
2. 카카오 OAuth

현재 사용자 이메일/비밀번호·이메일 OTP 로그인은 비활성화되어 있습니다. 공장 자체 로그인도 사용하지 않습니다. 관리자는 별도 관리자 인증을 사용합니다. 과거 설정 문서를 따라 비활성화된 기능을 임의 복원하지 않습니다.

인증은 커스텀 쿠키 세션 + Supabase `sessions` 테이블로 처리합니다.

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 메인 |
| `/factories` | 봉제공장 찾기 |
| `/matching` | 조건 기반 맞춤 추천 |
| `/design-request` | 디자인 의뢰 |
| `/news` | 언론 기사 목록 |
| `/esg` | ESG 안내 |
| `/admin` | 관리자 |

## 빌드

```bash
npm run build
npm run start
```

검증 명령과 환경값이 없는 경우의 처리, Preview·Production 확인 절차는 [개발 가이드](docs/development-workflow.md#6-검증-자동-검사와-실제-동작을-분리한다)를 따릅니다. 빌드 성공만으로 실제 DB·로그인 검증을 완료한 것으로 보지 않습니다.
