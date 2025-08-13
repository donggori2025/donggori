# Clerk 도메인 문제 해결 가이드

## 🚨 "앱이 Google의 OAuth 2.0 정책을 준수하지 않기 때문에 앱에 로그인할 수 없습니다" 오류 해결

### 문제 분석
오류 메시지: `redirect_uri=https://clerk.donggori.com/v1/oauth_callback`

이 오류는 Clerk이 커스텀 도메인을 사용하여 Google OAuth를 시도하지만, Google Cloud Console에 해당 리디렉션 URI가 등록되지 않았기 때문입니다.

## 해결 방법

### 방법 1: Google Cloud Console에 Clerk 도메인 등록 (권장)

#### 1.1 Google Cloud Console에서 리디렉션 URI 추가
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. **API 및 서비스** → **사용자 인증 정보** 메뉴로 이동
3. 기존 OAuth 2.0 클라이언트 ID 클릭
4. **승인된 리디렉션 URI** 섹션에서 **URI 추가** 클릭
5. 다음 URI 추가:
   ```
   https://clerk.donggori.com/v1/oauth_callback
   ```
6. **저장** 클릭

#### 1.2 Clerk 커스텀 도메인 활성화
1. `app/layout.tsx` 파일에서 주석 처리된 부분을 활성화:

```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
>
```

2. `.env.local` 파일에 Clerk 프론트엔드 API 설정:

```env
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.donggori.com
```

### 방법 2: Clerk 기본 도메인 사용 (임시 해결책)

#### 2.1 Clerk 기본 도메인으로 변경
1. `app/layout.tsx`에서 커스텀 도메인 설정을 주석 처리:

```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  // frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
>
```

2. Google Cloud Console에서 기본 Clerk 도메인 추가:
   ```
   https://donggori.clerk.accounts.dev/v1/oauth_callback
   ```

#### 2.2 환경 변수에서 커스텀 도메인 제거
`.env.local` 파일에서 다음 줄을 주석 처리:
```env
# NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.donggori.com
```

## 단계별 해결 과정

### 1단계: 현재 설정 확인
```bash
# 환경 변수 확인
bun run scripts/checkOAuthConfig.js
```

### 2단계: Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보**
4. OAuth 2.0 클라이언트 ID 클릭
5. **승인된 리디렉션 URI**에 다음 추가:
   - `https://clerk.donggori.com/v1/oauth_callback` (커스텀 도메인 사용 시)
   - `https://donggori.clerk.accounts.dev/v1/oauth_callback` (기본 도메인 사용 시)

### 3단계: Clerk 설정 업데이트
1. `app/layout.tsx` 수정
2. `.env.local` 파일 업데이트
3. 개발 서버 재시작: `bun run dev`

### 4단계: 테스트
1. 브라우저에서 로그인 시도
2. Google OAuth 플로우 확인
3. 콜백 처리 확인

## 추가 리디렉션 URI 목록

Google Cloud Console에 등록해야 할 모든 리디렉션 URI:

### 개발 환경
```
http://localhost:3000/v1/oauth_callback
http://127.0.0.1:3000/v1/oauth_callback
```

### 프로덕션 환경 (커스텀 도메인)
```
https://clerk.donggori.com/v1/oauth_callback
```

### 프로덕션 환경 (기본 도메인)
```
https://donggori.clerk.accounts.dev/v1/oauth_callback
```

## 문제 해결 체크리스트

- [ ] Google Cloud Console에 올바른 리디렉션 URI 등록
- [ ] Clerk 커스텀 도메인 설정 확인
- [ ] 환경 변수 설정 확인
- [ ] 개발 서버 재시작
- [ ] 브라우저 캐시 삭제
- [ ] OAuth 플로우 테스트

## 주의사항

1. **도메인 일치**: Google Cloud Console에 등록된 URI와 실제 사용하는 URI가 정확히 일치해야 합니다.
2. **프로토콜**: HTTPS와 HTTP를 구분하여 등록해야 합니다.
3. **경로**: `/v1/oauth_callback` 경로가 정확히 일치해야 합니다.
4. **캐시**: 설정 변경 후 브라우저 캐시를 삭제해야 할 수 있습니다.

## 추가 리소스

- [Clerk 커스텀 도메인 설정](https://clerk.com/docs/domains/overview)
- [Google OAuth 2.0 설정](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/) 