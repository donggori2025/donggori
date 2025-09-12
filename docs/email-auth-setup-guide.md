# 이메일 인증 시스템 구축 가이드

## 📋 개요

동고리 프로젝트에서 휴대폰 인증을 제거하고 이메일 인증으로 전환했습니다. 이 문서는 이메일 인증 시스템의 구축 과정과 설정 방법을 설명합니다.

## 🏗️ 시스템 구조

### 1. 인증 방식
- **이메일 OTP**: 6자리 숫자 코드
- **유효시간**: 5분
- **Rate Limiting**: 60초 간격
- **사용 목적**: `signup`, `login`, `reset`

### 2. 주요 컴포넌트

#### API 엔드포인트
- `POST /api/auth/email/request` - 이메일 인증번호 요청
- `POST /api/auth/email/verify` - 이메일 인증번호 검증
- `POST /api/auth/login` - 로그인 (이메일 인증 지원)

#### 라이브러리
- `lib/emailOtp.ts` - 이메일 OTP 생성, 검증 로직
- `lib/messaging.ts` - 이메일 발송 처리 (SendGrid 연동)

#### 데이터베이스
- `email_otps` 테이블 - 이메일 OTP 기록 저장

## 🗄️ 데이터베이스 설정

### Supabase 테이블 생성

```sql
-- 이메일 OTP 테이블 생성
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON public.email_otps(email, purpose);
CREATE INDEX IF NOT EXISTS idx_email_otps_created_at ON public.email_otps(created_at);

-- RLS 정책 설정
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage email_otps" ON public.email_otps
  FOR ALL USING (auth.role() = 'service_role');
```

실행 방법:
1. Supabase 대시보드 접속
2. SQL Editor에서 위 스크립트 실행
3. 또는 `scripts/create-email-otps-table.sql` 파일 사용

## ⚙️ 환경 변수 설정

### 이메일 발송 서비스 설정

```bash
# 이메일 제공자 선택: mock | sendgrid
EMAIL_PROVIDER=mock

# SendGrid 설정 (이메일 인증용)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@donggori.com
SENDGRID_FROM_NAME=동고리
```

### 개발 환경
- `EMAIL_PROVIDER=mock`으로 설정하면 실제 이메일 발송 없이 콘솔에 로그만 출력
- 개발/테스트 시 권장

### 프로덕션 환경
- `EMAIL_PROVIDER=sendgrid`로 설정하고 SendGrid API 키 설정
- 실제 이메일 발송

## 📧 SendGrid 설정 방법

### 1. SendGrid 계정 생성
1. [SendGrid 웹사이트](https://sendgrid.com/) 접속
2. 계정 생성 및 인증

### 2. API 키 생성
1. SendGrid 대시보드 → Settings → API Keys
2. "Create API Key" 클릭
3. 권한: "Full Access" 또는 "Mail Send" 권한만
4. 생성된 API 키를 `SENDGRID_API_KEY`에 설정

### 3. 발신자 인증
1. Settings → Sender Authentication
2. Single Sender Verification 또는 Domain Authentication
3. 발신자 이메일 주소를 `SENDGRID_FROM_EMAIL`에 설정

## 🔧 기능별 상세 설명

### 1. 회원가입 페이지 (`app/sign-up/page.tsx`)

#### 변경사항
- 휴대폰 인증 → 이메일 인증으로 전환
- 중복 가입 체크: 이메일 기준
- 전화번호는 선택사항으로 변경

#### 사용자 플로우
1. 이메일 입력
2. "이메일 인증" 버튼 클릭
3. 이메일로 인증번호 수신
4. 인증번호 입력 및 확인
5. 회원가입 완료

### 2. 로그인 페이지 (`app/sign-in/page.tsx`)

#### 새로운 기능
- 비밀번호 로그인 / 이메일 인증 로그인 선택 가능
- 이메일 인증 로그인: 비밀번호 없이 이메일 OTP로 로그인

#### 사용자 플로우 (이메일 인증 로그인)
1. "이메일 인증 로그인" 탭 선택
2. 이메일 입력
3. "이메일 인증" 버튼 클릭
4. 이메일로 인증번호 수신
5. 인증번호 입력 및 확인
6. 자동 로그인

### 3. 이메일 발송 시스템

#### SendGrid 연동
- 실제 이메일 발송을 위한 SendGrid API 사용
- HTML/텍스트 이메일 지원
- 발송 로그 기록

#### Mock 모드
- 개발 환경용
- 실제 이메일 발송 없이 콘솔에 로그 출력
- 테스트 및 개발 시 유용

## 🔒 보안 기능

### 1. Rate Limiting
- 60초 내 중복 요청 방지
- 동일 이메일로 연속 요청 제한

### 2. 코드 보안
- 6자리 랜덤 숫자 코드
- 5분 유효시간
- 일회성 사용 (사용 후 무효화)

### 3. 데이터베이스 보안
- RLS (Row Level Security) 적용
- 서비스 역할만 접근 가능

## 🧪 테스트 방법

### 1. 개발 환경 테스트
```bash
# 환경 변수 설정
EMAIL_PROVIDER=mock

# 애플리케이션 실행
npm run dev
```

### 2. 이메일 인증 테스트
1. 회원가입 페이지 접속
2. 이메일 입력 후 "이메일 인증" 클릭
3. 콘솔에서 발송 로그 확인
4. 인증번호 입력 및 확인

### 3. 프로덕션 환경 테스트
```bash
# 환경 변수 설정
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_actual_api_key
SENDGRID_FROM_EMAIL=your_verified_email

# 실제 이메일 발송 테스트
```

## 🚀 배포 시 주의사항

### 1. 환경 변수 설정
- 프로덕션 환경에서 `EMAIL_PROVIDER=sendgrid` 설정
- SendGrid API 키 및 발신자 정보 설정

### 2. 데이터베이스 마이그레이션
- Supabase에서 `email_otps` 테이블 생성 필수
- 기존 `phone_otps` 테이블은 유지 (다른 기능에서 사용 가능)

### 3. SendGrid 설정
- 발신자 도메인 인증 완료
- API 키 권한 확인
- 발송 제한 정책 검토

## 📊 모니터링

### 1. 이메일 발송 로그
- `message_logs` 테이블에서 발송 기록 확인
- 성공/실패 상태 추적

### 2. 인증 시도 로그
- `email_otps` 테이블에서 인증 시도 기록 확인
- Rate limiting 및 보안 모니터링

## 🔄 향후 개선사항

### 1. 이메일 템플릿 개선
- HTML 이메일 템플릿 적용
- 브랜드 디자인 적용

### 2. 추가 이메일 서비스 지원
- AWS SES 연동
- 다른 이메일 서비스 제공업체 지원

### 3. 고급 보안 기능
- IP 기반 Rate Limiting
- 의심스러운 활동 감지
- 2FA (2단계 인증) 지원

## 📞 지원 및 문의

이메일 인증 시스템 관련 문의사항이 있으시면 개발팀에 문의해주세요.

---

**작성일**: 2024년 12월
**버전**: 1.0
**작성자**: 개발팀
