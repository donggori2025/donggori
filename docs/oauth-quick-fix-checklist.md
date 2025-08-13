# OAuth 문제 빠른 해결 체크리스트

## 🚨 "redirect_uri_mismatch" 오류 해결

### 1단계: 환경 변수 확인
- [ ] `.env.local` 파일이 프로젝트 루트에 있는지 확인
- [ ] `GOOGLE_CLIENT_ID` 설정됨
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨
- [ ] `GOOGLE_REDIRECT_URI=http://localhost:3000/v1/oauth_callback` 설정됨

### 2단계: Google Cloud Console 설정 확인
- [ ] [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
- [ ] 올바른 프로젝트 선택
- [ ] **API 및 서비스** → **사용자 인증 정보** → **OAuth 2.0 클라이언트 ID** 선택
- [ ] **승인된 리디렉션 URI**에 다음 URI들이 등록되어 있는지 확인:
  - [ ] `http://localhost:3000/v1/oauth_callback`
  - [ ] `http://127.0.0.1:3000/v1/oauth_callback` (선택사항)

### 3단계: Clerk 설정 확인
- [ ] [Clerk 대시보드](https://dashboard.clerk.com/) 접속
- [ ] **User & Authentication** → **Social Connections** 메뉴로 이동
- [ ] Google OAuth 설정에서 **Redirect URLs** 확인:
  - [ ] `http://localhost:3000/v1/oauth_callback` (개발용)
  - [ ] `https://your-domain.com/v1/oauth_callback` (배포용)

### 4단계: 코드 확인
- [ ] `app/sign-in/page.tsx`에서 `redirectUrl: '/v1/oauth_callback'` 확인
- [ ] `app/api/auth/oauth-callback/route.ts`에서 리디렉션 URI 처리 확인
- [ ] `app/v1/oauth_callback/page.tsx` 파일 존재 확인

### 5단계: 테스트
- [ ] 개발 서버 재시작: `bun run dev`
- [ ] 브라우저 캐시 삭제
- [ ] OAuth 로그인 시도
- [ ] 브라우저 개발자 도구 > Network 탭에서 OAuth 요청 확인

## 🔧 디버깅 도구

### 설정 확인 스크립트
```bash
bun run scripts/checkOAuthConfig.js
```

### 리디렉션 URI 디버깅
```bash
bun run scripts/debugOAuthRedirect.js
```

## 📋 일반적인 문제와 해결책

### 문제 1: "Missing required parameter: client_id"
**해결책:**
- Google OAuth 클라이언트 ID 생성
- `.env.local`에 `GOOGLE_CLIENT_ID` 설정

### 문제 2: "redirect_uri_mismatch"
**해결책:**
- Google Cloud Console에서 정확한 리디렉션 URI 등록
- 환경 변수 `GOOGLE_REDIRECT_URI` 확인

### 문제 3: "invalid_request"
**해결책:**
- OAuth 동의 화면 설정 완료
- 클라이언트 ID와 시크릿 재확인

### 문제 4: "access_denied"
**해결책:**
- OAuth 동의 화면에서 테스트 사용자 등록
- 사용자가 권한을 거부하지 않았는지 확인

## 🚀 배포 시 추가 확인사항

### 프로덕션 환경 설정
- [ ] Google Cloud Console에 프로덕션 도메인 리디렉션 URI 추가
- [ ] Clerk 대시보드에 프로덕션 도메인 리디렉션 URL 추가
- [ ] 환경 변수 `GOOGLE_REDIRECT_URI`를 프로덕션 URL로 변경
- [ ] HTTPS 사용 확인

### OAuth 동의 화면 검토
- [ ] 프로덕션 배포 시 Google 검토 과정 진행
- [ ] 검토 완료까지 테스트 사용자만 사용 가능

## 📞 추가 도움

문제가 지속되면 다음을 확인하세요:
1. 브라우저 개발자 도구의 Network 탭에서 실제 요청 확인
2. 서버 로그에서 상세한 오류 메시지 확인
3. Google Cloud Console의 OAuth 동의 화면 설정 확인
