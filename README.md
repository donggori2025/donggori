# 동고리 (DONGGORI)

봉제공장이 필요한 순간, 동고리

## 시작하기

### 필수 요구사항

- Node.js 20+
- Supabase (PostgreSQL)
- Vercel (프로덕션 배포)

### 설치 및 실행

```bash
npm install
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

1. 이메일/비밀번호
2. 네이버 OAuth
3. 카카오 OAuth

인증은 커스텀 쿠키 세션 + Supabase `sessions` 테이블로 처리합니다.

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 메인 |
| `/factories` | 봉제공장 찾기 |
| `/matching` | AI 매칭 |
| `/design-request` | 디자인 의뢰 |
| `/admin` | 관리자 |

## 빌드

```bash
npm run build
npm run start
```
