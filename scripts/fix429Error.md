# 🚨 429 Too Many Requests 오류 해결 가이드

## 현재 상황
- "429 Too Many Requests" 오류 발생
- OAuth 요청이 너무 많이 발생해서 Google에서 일시적으로 차단
- "OAuth 로그인 오류: e" 메시지 표시

## 🔧 즉시 해결 방법

### 1. 브라우저 캐시 및 쿠키 완전 삭제
1. **Chrome**: Ctrl+Shift+Delete (Windows) 또는 Cmd+Shift+Delete (Mac)
2. **모든 시간** 선택
3. **다음 항목들 체크**:
   - 쿠키 및 기타 사이트 데이터
   - 캐시된 이미지 및 파일
   - 로그인 데이터
4. **데이터 삭제** 클릭

### 2. 시크릿/프라이빗 모드에서 테스트
- Chrome: Ctrl+Shift+N (Windows) 또는 Cmd+Shift+N (Mac)
- Firefox: Ctrl+Shift+P (Windows) 또는 Cmd+Shift+P (Mac)
- Safari: Cmd+Shift+N (Mac)

### 3. 다른 브라우저에서 테스트
- Chrome → Firefox 또는 Safari
- 다른 브라우저에서 OAuth 로그인 시도

### 4. 시간 대기
- **최소 30분 대기** (Google의 차단 시간)
- 그 후 다시 OAuth 로그인 시도

## 🚨 추가 확인 사항

### 1. Google Cloud Console 설정 재확인
- https://console.cloud.google.com/
- APIs & Services > Credentials
- OAuth 2.0 Client IDs에서 리디렉션 URI 확인

### 2. Clerk 대시보드 설정 재확인
- https://dashboard.clerk.com/
- User & Authentication > Social Connections
- Google OAuth 설정 확인

### 3. 환경 변수 확인
- `.env.local` 파일에서 Clerk 키 확인
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정 확인

## 📝 디버깅 팁

### 1. 네트워크 탭 확인
- DevTools > Network 탭
- OAuth 요청이 어떤 URL로 가는지 확인
- 429 오류가 발생하는 정확한 요청 확인

### 2. Console 로그 확인
- OAuth 로그인 시작 메시지 확인
- 구체적인 오류 메시지 확인

### 3. Clerk 로그 확인
- Clerk 대시보드에서 로그 확인
- OAuth 관련 오류 메시지 확인

## 🚨 만약 여전히 안 된다면

### 대안 1: Google 계정 확인
- Google 계정이 정상인지 확인
- 2단계 인증 설정 확인

### 대안 2: 다른 OAuth 제공자 사용
- Kakao 또는 Naver 로그인으로 테스트
- Google OAuth만 문제인지 확인

### 대안 3: Clerk 지원팀 문의
- https://clerk.com/support
- 429 오류 관련 문의

## ⏰ 권장 대기 시간
- **429 오류 후**: 30분 - 1시간
- **Google OAuth 차단**: 최대 24시간
- **완전 초기화**: 24시간 후 재시도

