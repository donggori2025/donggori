# Google Cloud Console OAuth 리디렉션 URI 수정 가이드

## 🚨 현재 오류
```
앱이 Google의 OAuth 2.0 정책을 준수하지 않기 때문에 앱에 로그인할 수 없습니다.
요청 세부정보: redirect_uri=https://clerk.donggori.com/v1/oauth_callback
```

## 🔧 Google Cloud Console에서 추가해야 할 리디렉션 URI

### 1. Google Cloud Console 접속
- https://console.cloud.google.com/
- APIs & Services > Credentials
- OAuth 2.0 Client IDs 선택

### 2. 현재 요청되는 리디렉션 URI (추가 필요)
- ✅ `https://clerk.donggori.com/v1/oauth_callback`
- ✅ `https://donggori.clerk.accounts.dev/v1/oauth_callback`

### 3. 추가로 필요한 리디렉션 URI
- ✅ `https://clerk.donggori.com/`
- ✅ `https://donggori.clerk.accounts.dev/`
- ✅ `http://localhost:3000/` (개발 환경)

### 4. Clerk 대시보드 설정 확인
- https://dashboard.clerk.com/
- User & Authentication > Social Connections
- Google OAuth 설정에서 리디렉션 URI도 동일하게 추가

### 5. 즉시 해결 방법
1. Google Cloud Console에서 위의 모든 URI를 추가
2. 특히 `https://clerk.donggori.com/v1/oauth_callback` 반드시 추가
3. 저장 후 몇 분 대기
4. 브라우저 캐시 및 쿠키 삭제
5. OAuth 로그인 재시도

## 🚨 중요 사항
- Clerk이 내부적으로 `/v1/oauth_callback`을 사용하고 있음
- 이 URI를 Google Cloud Console에 반드시 추가해야 함
- URI는 정확히 일치해야 함 (대소문자, 슬래시 등)
