# Google Cloud Console OAuth 리디렉션 URI 업데이트 가이드

## 🔧 Google Cloud Console에서 업데이트해야 할 리디렉션 URI

### 1. Google Cloud Console 접속
- https://console.cloud.google.com/
- APIs & Services > Credentials
- OAuth 2.0 Client IDs 선택

### 2. 현재 설정된 리디렉션 URI (삭제)
- ❌ `https://donggori.clerk.accounts.dev/sso-callback`
- ❌ `https://clerk.donggori.com/sso-callback`
- ❌ `http://localhost:3000/sso-callback`

### 3. 새로 추가해야 할 리디렉션 URI
- ✅ `https://donggori.clerk.accounts.dev/`
- ✅ `https://clerk.donggori.com/` (커스텀 도메인 사용 시)
- ✅ `http://localhost:3000/` (개발 환경)

### 4. Clerk 대시보드 설정 확인
- https://dashboard.clerk.com/
- User & Authentication > Social Connections
- Google OAuth 설정에서 리디렉션 URI도 동일하게 업데이트

### 5. 변경 사항
- OAuth 콜백을 `/sso-callback`에서 메인 페이지(`/`)로 변경
- 더 간단하고 안정적인 OAuth 플로우 구현

### 6. 테스트 방법
1. Google Cloud Console에서 리디렉션 URI 업데이트
2. Clerk 대시보드에서 설정 확인
3. 브라우저 캐시 및 쿠키 삭제
4. Google OAuth 로그인 테스트

## 🚨 중요 사항
- 리디렉션 URI는 정확히 일치해야 함
- 프로토콜(http/https)도 정확히 일치해야 함
- 끝에 슬래시(/)가 있는지 없는지도 정확히 일치해야 함
