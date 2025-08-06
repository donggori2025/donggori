# Clerk 도메인 제한 문제 해결 가이드

## 문제 상황
`@faddit.co.kr` 도메인으로 회원가입/로그인하는 사용자들이 문제를 겪고 있습니다.

## 해결 방법

### 1. Clerk 대시보드에서 확인할 설정

#### A. Email & Phone 설정
1. Clerk 대시보드 접속
2. **User & Authentication** > **Email, Phone, Username** 메뉴로 이동
3. **Email Addresses** 섹션에서 **Allowed email domains** 확인
4. 만약 도메인 제한이 설정되어 있다면:
   - `faddit.co.kr`을 허용 목록에 추가
   - 또는 도메인 제한을 완전히 해제

#### B. OAuth Providers 설정
1. **User & Authentication** > **Social Connections** 메뉴로 이동
2. 각 OAuth 제공자(Google, Kakao, Naver)의 설정 확인:
   - **Redirect URLs**에 `https://your-domain.com/v1/oauth_callback` 포함되어 있는지 확인
   - **Allowed email domains** 설정 확인

#### C. User Management 설정
1. **User & Authentication** > **User Management** 메뉴로 이동
2. **Sign-up restrictions** 확인:
   - 도메인 제한이 설정되어 있다면 `faddit.co.kr` 추가
   - 또는 제한을 해제

### 2. 환경 변수 설정

`.env.local` 파일에 다음 설정을 추가하거나 수정:

```env
# Clerk 인증 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# 도메인 제한 설정 (선택사항)
# 모든 도메인 허용하려면 이 줄을 주석 처리하거나 삭제
CLERK_ALLOWED_EMAIL_DOMAINS=gmail.com,naver.com,kakao.com,faddit.co.kr
```

### 3. 코드 수정 사항

이미 다음 파일들이 수정되었습니다:

- `lib/clerkConfig.ts`: 도메인 검증 로직 추가
- `app/sign-up/page.tsx`: 회원가입 시 도메인 검증 추가
- `app/sign-in/page.tsx`: 로그인 시 도메인 검증 추가

### 4. 테스트 방법

#### A. 스크립트로 설정 확인
```bash
bun run scripts/checkClerkConfig.js
```

#### B. 수동 테스트
1. `@faddit.co.kr` 도메인으로 회원가입 시도
2. 오류 메시지 확인
3. 개발자 도구에서 네트워크 탭 확인하여 API 호출 상태 확인

### 5. 추가 확인사항

#### A. Clerk 대시보드에서 확인할 항목
- **User & Authentication** > **Email, Phone, Username** > **Email Addresses**
- **User & Authentication** > **Social Connections** > 각 OAuth 제공자
- **User & Authentication** > **User Management** > **Sign-up restrictions**

#### B. 네트워크 설정
- **User & Authentication** > **User Management** > **Network**
- **Redirect URLs** 설정 확인
- **Allowed origins** 설정 확인

### 6. 문제가 지속되는 경우

1. **Clerk 로그 확인**
   - Clerk 대시보드에서 **Logs** 섹션 확인
   - 실패한 인증 시도 로그 확인

2. **브라우저 개발자 도구 확인**
   - Network 탭에서 API 호출 상태 확인
   - Console 탭에서 JavaScript 오류 확인

3. **환경 변수 재확인**
   ```bash
   bun run scripts/checkClerkConfig.js
   ```

### 7. 임시 해결책

만약 즉시 해결이 어려운 경우:

1. **도메인 제한 완전 해제**
   - Clerk 대시보드에서 모든 도메인 제한 해제
   - `.env.local`에서 `CLERK_ALLOWED_EMAIL_DOMAINS` 주석 처리

2. **대체 이메일 사용**
   - 사용자에게 임시로 다른 이메일 도메인 사용 요청

### 8. 예방 조치

향후 유사한 문제를 방지하기 위해:

1. **정기적인 설정 확인**
   - 새로운 도메인 추가 시 Clerk 설정 업데이트
   - 환경 변수 정기 점검

2. **모니터링 설정**
   - Clerk 로그 모니터링
   - 사용자 피드백 수집 시스템 구축

## 연락처

문제가 지속되는 경우:
- Clerk 지원팀: https://clerk.com/support
- 프로젝트 관리자에게 문의 