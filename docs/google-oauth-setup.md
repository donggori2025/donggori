# Google OAuth 설정 가이드

## 🚨 "Missing required parameter: client_id" 오류 해결

이 오류는 Google OAuth 설정이 누락되어 발생하는 문제입니다.

## 1. Google Cloud Console에서 OAuth 2.0 클라이언트 생성

### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. Google 계정으로 로그인

### 1.2 프로젝트 생성 또는 선택
1. 상단의 프로젝트 선택 드롭다운 클릭
2. **새 프로젝트** 또는 기존 프로젝트 선택
3. 프로젝트 이름: `donggori-oauth` (또는 원하는 이름)

### 1.3 OAuth 동의 화면 설정
1. **API 및 서비스** → **OAuth 동의 화면** 메뉴로 이동
2. **외부** 선택 후 **만들기** 클릭
3. 앱 정보 입력:
   - **앱 이름**: 동고리
   - **사용자 지원 이메일**: your-email@gmail.com
   - **개발자 연락처 정보**: your-email@gmail.com
4. **저장 후 계속** 클릭
5. **범위** 섹션에서 **저장 후 계속** 클릭
6. **테스트 사용자** 섹션에서 **저장 후 계속** 클릭
7. **요약**에서 **대시보드로 돌아가기** 클릭

### 1.4 OAuth 2.0 클라이언트 ID 생성
1. **API 및 서비스** → **사용자 인증 정보** 메뉴로 이동
2. **사용자 인증 정보 만들기** → **OAuth 2.0 클라이언트 ID** 클릭
3. **애플리케이션 유형**: **웹 애플리케이션** 선택
4. **이름**: 동고리 OAuth 클라이언트
5. **승인된 리디렉션 URI** 추가:
   - `http://localhost:3000/v1/oauth_callback` (개발용)
   - `https://your-domain.com/v1/oauth_callback` (배포용)
6. **만들기** 클릭
7. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

## 2. 환경 변수 설정

### 2.1 .env.local 파일 수정
프로젝트 루트의 `.env.local` 파일에 다음 내용을 추가:

```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/v1/oauth_callback
```

### 2.2 실제 값으로 교체
- `your-actual-google-client-id`: Google Cloud Console에서 생성한 클라이언트 ID
- `your-actual-google-client-secret`: Google Cloud Console에서 생성한 클라이언트 보안 비밀번호

## 3. 설정 확인

### 3.1 스크립트로 확인
```bash
bun run scripts/checkOAuthConfig.js
```

### 3.2 수동 확인
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. Google OAuth 관련 환경 변수가 올바르게 설정되었는지 확인
3. 개발 서버 재시작: `bun run dev`

## 4. 문제 해결

### 4.1 "invalid_request" 오류
**원인:**
- 잘못된 클라이언트 ID 또는 시크릿
- 리디렉션 URI가 Google Cloud Console에 등록되지 않음
- OAuth 동의 화면이 설정되지 않음

**해결 방법:**
1. Google Cloud Console에서 클라이언트 ID와 시크릿 재확인
2. 리디렉션 URI가 정확히 등록되었는지 확인
3. OAuth 동의 화면 설정 완료

### 4.2 "redirect_uri_mismatch" 오류
**원인:**
- 환경 변수의 리디렉션 URI와 Google Cloud Console에 등록된 URI가 다름
- 프로토콜(http/https) 불일치
- 포트 번호 불일치
- 경로 불일치

**해결 방법:**
1. **Google Cloud Console에서 정확한 URI 등록**:
   - `http://localhost:3000/v1/oauth_callback` (개발용)
   - `http://127.0.0.1:3000/v1/oauth_callback` (개발용 대안)
   - `https://your-domain.com/v1/oauth_callback` (배포용)

2. **환경 변수 확인**:
   ```env
   GOOGLE_REDIRECT_URI=http://localhost:3000/v1/oauth_callback
   ```

3. **디버깅 스크립트 실행**:
   ```bash
   bun run scripts/debugOAuthRedirect.js
   ```

4. **브라우저 개발자 도구에서 확인**:
   - Network 탭에서 OAuth 요청의 `redirect_uri` 파라미터 확인
   - 실제로 전송되는 URI와 등록된 URI 비교

### 4.3 "access_denied" 오류
**원인:**
- 사용자가 OAuth 권한을 거부함
- 테스트 사용자로 등록되지 않음

**해결 방법:**
1. OAuth 동의 화면에서 테스트 사용자로 등록
2. 프로덕션 배포 시 Google 검토 과정 진행

## 5. 배포 시 주의사항

### 5.1 프로덕션 환경 설정
배포 시 다음 사항을 확인하세요:

1. **리디렉션 URI 추가**:
   - `https://your-domain.com/v1/oauth_callback`

2. **환경 변수 업데이트**:
   ```env
   GOOGLE_REDIRECT_URI=https://your-domain.com/v1/oauth_callback
   ```

3. **OAuth 동의 화면 검토**:
   - 프로덕션 배포 시 Google 검토 과정 필요
   - 검토 완료까지 테스트 사용자만 사용 가능

### 5.2 보안 고려사항
1. **클라이언트 시크릿 보호**:
   - 클라이언트 시크릿은 서버에서만 사용
   - 클라이언트 사이드 코드에 노출 금지

2. **HTTPS 사용**:
   - 프로덕션에서는 반드시 HTTPS 사용
   - HTTP는 보안상 위험

## 6. 추가 리소스

- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 플로우 가이드](https://developers.google.com/identity/protocols/oauth2/web-server)
