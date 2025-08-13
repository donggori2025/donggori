# 🚨 긴급 OAuth 수정 가이드

## 현재 상황
- Clerk이 `https://clerk.donggori.com/v1/oauth_callback`로 리디렉트하려고 함
- Google Cloud Console에 해당 URI가 등록되지 않아 오류 발생

## 🔧 즉시 해결 방법

### 1. Google Cloud Console에서 다음 URI들을 모두 추가
- https://console.cloud.google.com/
- APIs & Services > Credentials > OAuth 2.0 Client IDs

**추가할 URI 목록:**
```
https://clerk.donggori.com/v1/oauth_callback
https://donggori.clerk.accounts.dev/v1/oauth_callback
https://clerk.donggori.com/
https://donggori.clerk.accounts.dev/
http://localhost:3000/
```

### 2. Clerk 대시보드에서도 동일하게 설정
- https://dashboard.clerk.com/
- User & Authentication > Social Connections > Google
- Authorized redirect URIs에 위의 모든 URI 추가

### 3. 환경 변수 확인
현재 `NEXT_PUBLIC_CLERK_FRONTEND_API`가 주석 처리되어 있어서 기본 도메인을 사용 중입니다.

### 4. 테스트 방법
1. Google Cloud Console에서 URI 추가 후 저장
2. 5-10분 대기 (설정 반영 시간)
3. 브라우저 캐시 및 쿠키 삭제
4. 시크릿 모드에서 OAuth 로그인 테스트

## 🚨 만약 여전히 안 된다면

### 대안 1: 기본 Clerk 도메인만 사용
Google Cloud Console에서 다음 URI만 남기고 나머지 삭제:
```
https://donggori.clerk.accounts.dev/v1/oauth_callback
https://donggori.clerk.accounts.dev/
```

### 대안 2: 커스텀 도메인 완전 비활성화
1. `app/layout.tsx`에서 `frontendApi` 주석 유지
2. Google Cloud Console에서 기본 도메인 URI만 사용

## 📞 추가 지원
- Clerk 지원팀: https://clerk.com/support
- Google Cloud Console 문서: https://developers.google.com/identity/protocols/oauth2
