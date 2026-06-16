# 동고리 (DONGGORI)

봉제공장이 필요한 순간, 동고리

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 또는 Bun
- PostgreSQL 데이터베이스
- Supabase 계정
- Clerk 인증 서비스 계정

### 설치 및 실행

1. **의존성 설치**
   ```bash
   bun install
   ```

2. **환경 변수 설정**
   ```bash
   cp env.example .env
   # .env 파일을 편집하여 필요한 값들을 설정하세요
   ```

   - 프로덕션에서는 `ADMIN_SESSION_SECRET`을 반드시 설정하세요. 미설정 시 서버 재시작마다 관리자 세션이 무효화됩니다.

3. **데이터베이스 마이그레이션**
   ```bash
   bun run db:push
   ```

4. **개발 서버 실행**
   ```bash
   bun dev
   ```

## 🔐 OAuth 설정

### 자동 설정 (권장)

OAuth 설정을 위한 환경 변수를 자동으로 설정할 수 있습니다:

```bash
./scripts/setup-oauth.sh
```

### 수동 설정

#### 1. 네이버 OAuth
- [네이버 개발자 센터](https://developers.naver.com/apps/#/list)에서 애플리케이션 등록
- 서비스 URL: `http://localhost:3000` (개발), `https://donggori.com` (프로덕션)
- Callback URL: `http://localhost:3000/api/auth/naver/callback` (개발), `https://donggori.com/api/auth/naver/callback` (프로덕션)

#### 2. 카카오 OAuth
- [카카오 개발자 센터](https://developers.kakao.com/console/app)에서 애플리케이션 등록
- 플랫폼 > Web > 사이트 도메인: `http://localhost:3000` (개발), `https://donggori.com` (프로덕션)
- Redirect URI: `http://localhost:3000/api/auth/kakao/callback` (개발), `https://donggori.com/api/auth/kakao/callback` (프로덕션)

#### 3. 구글 OAuth
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 OAuth 2.0 클라이언트 ID 생성
- 승인된 리디렉션 URI: `https://donggori.clerk.accounts.dev/v1/oauth_callback` (개발), `https://clerk.donggori.com/v1/oauth_callback` (프로덕션)

### 환경 변수

```bash
# 네이버 OAuth
NEXT_PUBLIC_NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 카카오 OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 구글 OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🛡️ 중복 회원가입 방지

동고리는 이메일 기반으로 중복 회원가입을 방지합니다:

- **동일 이메일**: 하나의 이메일로는 하나의 계정만 생성 가능
- **소셜 로그인 연동**: 기존 계정이 있는 경우 소셜 계정을 연동하여 로그인 가능
- **계정 통합**: 여러 소셜 로그인을 하나의 계정에 연동 가능

### 지원하는 로그인 방법

1. **이메일/비밀번호**: 전통적인 회원가입 및 로그인
2. **구글 OAuth**: Clerk을 통한 구글 계정 연동
3. **네이버 OAuth**: 네이버 계정으로 로그인
4. **카카오 OAuth**: 카카오 계정으로 로그인

## 🏗️ 프로젝트 구조

```
donggori/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API 라우트
│   │   └── auth/          # 인증 관련 API
│   ├── sign-in/           # 로그인 페이지
│   ├── sign-up/           # 회원가입 페이지
│   └── ...
├── components/             # React 컴포넌트
├── lib/                    # 유틸리티 및 서비스
├── prisma/                 # 데이터베이스 스키마
└── scripts/                # 유틸리티 스크립트
```

## 🧪 테스트

```bash
bun test
```

## 🚀 배포

### Vercel (권장)

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포

### 수동 배포

```bash
bun run build
bun start
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.