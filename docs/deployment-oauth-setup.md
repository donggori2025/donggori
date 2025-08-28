# 배포 환경 소셜 로그인 설정 가이드

## 개요
배포된 사이트에서 네이버, 카카오 소셜 로그인이 정상 작동하도록 설정하는 방법입니다.

## 1. Vercel 환경 변수 설정

### 필수 환경 변수
Vercel 대시보드에서 다음 환경 변수들을 설정해주세요:

```env
# 네이버 OAuth
NEXT_PUBLIC_NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 카카오 OAuth  
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 사이트 URL (선택사항)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 자동 설정되는 변수
다음 변수들은 Vercel에서 자동으로 설정됩니다:
- `VERCEL_URL`: 배포된 사이트의 URL (예: `donggori-git-main-username.vercel.app`)

## 2. 네이버 개발자 센터 설정

### 1) 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력

### 2) 서비스 URL 설정
- **서비스 URL**: `https://your-domain.com`
- **비로그인 Redirect URL**: `https://your-domain.com/api/auth/naver/callback`

### 3) 환경별 설정
개발과 배포 환경을 모두 지원하려면:

**개발 환경:**
- 서비스 URL: `http://localhost:3000`
- 비로그인 Redirect URL: `http://localhost:3000/api/auth/naver/callback`

**배포 환경:**
- 서비스 URL: `https://your-domain.com`
- 비로그인 Redirect URL: `https://your-domain.com/api/auth/naver/callback`

## 3. 카카오 개발자 센터 설정

### 1) 애플리케이션 등록
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. "애플리케이션 추가" 클릭
3. 애플리케이션 정보 입력

### 2) 플랫폼 설정
**Web 플랫폼 추가:**
- 사이트 도메인: `https://your-domain.com`
- Redirect URI: `https://your-domain.com/api/auth/kakao/callback`

### 3) 동의항목 설정
필수 동의항목:
- 닉네임 (profile_nickname)
- 프로필 사진 (profile_image)
- 이메일 (account_email)

### 4) 환경별 설정
개발과 배포 환경을 모두 지원하려면:

**개발 환경:**
- 사이트 도메인: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/kakao/callback`

**배포 환경:**
- 사이트 도메인: `https://your-domain.com`
- Redirect URI: `https://your-domain.com/api/auth/kakao/callback`

## 4. 동적 리다이렉트 URI 시스템

### 작동 방식
코드에서 환경에 따라 자동으로 리다이렉트 URI를 설정합니다:

```typescript
// 개발 환경
if (process.env.NODE_ENV === 'development') {
  return 'http://localhost:3000/api/auth/naver/callback';
}

// 프로덕션 환경
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://donggori.vercel.app';

return `${baseUrl}/api/auth/naver/callback`;
```

### Vercel URL 형식
- `donggori-git-main-username.vercel.app`
- `donggori-username.vercel.app`
- `your-custom-domain.com`

## 5. 문제 해결

### 일반적인 오류

#### 1) "앱 관리자 설정 오류 (KOE101)"
- **원인**: 카카오 개발자 센터에서 Redirect URI가 잘못 설정됨
- **해결**: 카카오 개발자 센터에서 정확한 Redirect URI 설정

#### 2) "페이지를 찾을 수 없습니다"
- **원인**: 네이버 개발자 센터에서 Redirect URI가 잘못 설정됨
- **해결**: 네이버 개발자 센터에서 정확한 Redirect URI 설정

#### 3) "client_id가 undefined"
- **원인**: 환경 변수가 제대로 로드되지 않음
- **해결**: Vercel에서 환경 변수 재설정 후 재배포

### 디버깅 방법

#### 1) 환경 변수 확인
```bash
# Vercel CLI로 환경 변수 확인
vercel env ls
```

#### 2) 로그 확인
Vercel 대시보드에서 Function Logs 확인:
- `/api/auth/naver/callback` 로그
- `/api/auth/kakao/callback` 로그

#### 3) 브라우저 개발자 도구
- Network 탭에서 OAuth 요청 확인
- Console 탭에서 오류 메시지 확인

## 6. 배포 후 확인사항

### 1) 환경 변수 로드 확인
브라우저 콘솔에서:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_URL:', process.env.VERCEL_URL);
```

### 2) OAuth URL 확인
로그인 버튼 클릭 시 생성되는 URL 확인:
- 네이버: `https://nid.naver.com/oauth2.0/authorize?...`
- 카카오: `https://kauth.kakao.com/oauth/authorize?...`

### 3) 콜백 URL 확인
OAuth 콜백이 올바른 URL로 리다이렉트되는지 확인:
- 네이버: `https://your-domain.com/api/auth/naver/callback`
- 카카오: `https://your-domain.com/api/auth/kakao/callback`

## 7. 보안 고려사항

### 1) 환경 변수 보안
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에 노출됨
- 민감한 정보는 서버 전용 변수로 설정

### 2) HTTPS 필수
- 프로덕션 환경에서는 반드시 HTTPS 사용
- HTTP는 OAuth 제공자가 거부할 수 있음

### 3) 도메인 검증
- OAuth 제공자가 설정한 도메인과 실제 도메인이 일치해야 함
- 서브도메인도 별도로 등록 필요

## 8. 추가 리소스

- [네이버 로그인 API 문서](https://developers.naver.com/docs/login/api/)
- [카카오 로그인 API 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Vercel 환경 변수 설정](https://vercel.com/docs/projects/environment-variables)
