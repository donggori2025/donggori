# OAuth 문제 빠른 해결 체크리스트

## 🚨 "앱이 Google의 OAuth 2.0 정책을 준수하지 않기 때문에 앱에 로그인할 수 없습니다" 오류

### 즉시 해결 방법 (5분 내)

#### 1단계: Google Cloud Console에서 리디렉션 URI 추가
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보** 메뉴로 이동
3. OAuth 2.0 클라이언트 ID 클릭
4. **승인된 리디렉션 URI** 섹션에서 **URI 추가** 클릭
5. 다음 URI 추가:
   ```
   https://donggori.clerk.accounts.dev/v1/oauth_callback
   ```
6. **저장** 클릭

#### 2단계: 환경 변수 확인
`.env.local` 파일에서 다음 설정 확인:
```env
GOOGLE_REDIRECT_URI=https://donggori.clerk.accounts.dev/v1/oauth_callback
```

#### 3단계: 개발 서버 재시작
```bash
bun run dev
```

#### 4단계: 브라우저 캐시 삭제
- 브라우저에서 `Ctrl+Shift+R` (Windows) 또는 `Cmd+Shift+R` (Mac)
- 또는 개발자 도구에서 **Application** → **Storage** → **Clear storage**

### 상세 진단

#### 현재 설정 확인
```bash
bun run scripts/checkOAuthConfig.js
```

#### 예상 출력:
```
📋 Google OAuth 설정:
   Client ID: ✅ 설정됨
   Client Secret: ✅ 설정됨
   Redirect URI: https://donggori.clerk.accounts.dev/v1/oauth_callback

📋 Clerk 설정:
   Publishable Key: ✅ 설정됨
   Secret Key: ✅ 설정됨
   Frontend API: 기본 Clerk 도메인 사용

📋 레이아웃 설정:
   Clerk 커스텀 도메인: ⚠️  주석 처리됨 (기본 도메인 사용)
```

### 문제가 지속되는 경우

#### 1. 추가 리디렉션 URI 등록
Google Cloud Console에 다음 URI들도 추가:
```
http://localhost:3000/v1/oauth_callback
http://127.0.0.1:3000/v1/oauth_callback
```

#### 2. Clerk 설정 확인
- [Clerk 대시보드](https://dashboard.clerk.com/)에서 OAuth 설정 확인
- Google OAuth가 활성화되어 있는지 확인

#### 3. 네트워크 탭 확인
브라우저 개발자 도구에서:
1. **Network** 탭 열기
2. 로그인 시도
3. OAuth 요청의 `redirect_uri` 파라미터 확인
4. 실제 전송되는 URI와 등록된 URI 비교

### 커스텀 도메인 사용 시

만약 `clerk.donggori.com` 커스텀 도메인을 사용하려면:

#### 1. Google Cloud Console에 추가 URI 등록
```
https://clerk.donggori.com/v1/oauth_callback
```

#### 2. 환경 변수 수정
```env
GOOGLE_REDIRECT_URI=https://clerk.donggori.com/v1/oauth_callback
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.donggori.com
```

#### 3. 레이아웃 파일 수정
`app/layout.tsx`에서 주석 해제:
```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
>
```

### 체크리스트

- [ ] Google Cloud Console에 `https://donggori.clerk.accounts.dev/v1/oauth_callback` 등록
- [ ] `.env.local`에서 `GOOGLE_REDIRECT_URI` 설정 확인
- [ ] 개발 서버 재시작
- [ ] 브라우저 캐시 삭제
- [ ] 로그인 테스트

### 추가 리소스

- [Google Cloud Console](https://console.cloud.google.com/)
- [Clerk 대시보드](https://dashboard.clerk.com/)
- [상세 가이드](docs/clerk-domain-issue-guide.md)
