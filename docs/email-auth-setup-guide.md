# 이메일 인증 설정

동고리 회원가입과 비밀번호 재설정은 실제 이메일 OTP를 사용한다. OTP 또는 수신자 이메일을 콘솔·DB 메시지 로그에 복사하는 mock 발송 모드는 지원하지 않는다.

## 1. Supabase

신규 환경에서는 먼저 `scripts/create-email-otps-table.sql`을 적용한 뒤, 모든 환경에서 `supabase/migrations/20260828_email_otp_verify_attempts.sql`을 적용한다.

`email_otps`에는 다음 필드가 필요하다.

- `email`, `purpose`
- SHA-256 해시가 저장되는 `code`
- `expires_at`, `consumed_at`, `created_at`
- 5회 검증 제한을 위한 `verify_attempts`

테이블은 RLS를 켜고 `anon`, `authenticated`의 권한을 회수한다. 브라우저가 직접 접근하지 않으며 Vercel 서버의 service role만 사용한다.

## 2. SendGrid

1. SendGrid에서 발신 도메인 또는 Single Sender를 인증한다.
2. 메일 발송 전용 최소 권한 API 키를 만든다.
3. Vercel의 Development, Preview, Production 환경에 아래 값을 각각 등록한다.

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=동고리
```

`SENDGRID_FROM_EMAIL`에는 SendGrid에서 검증된 주소를 사용한다. 키와 발신 주소가 없으면 요청은 성공으로 가장하지 않고 실패한다.

## 3. 확인

1. `POST /api/auth/email/request`로 본인이 관리하는 테스트 메일에 OTP를 요청한다.
2. 60초 내 재요청이 거부되는지 확인한다.
3. 잘못된 코드가 5회 뒤 차단되는지 확인한다.
4. 5분이 지난 코드와 한 번 사용된 코드가 거부되는지 확인한다.
5. Vercel 로그와 Supabase 로그에 OTP 원문, 이메일 본문, API 키가 남지 않는지 확인한다.

운영 테스트는 Preview에서 먼저 수행한다. 실사용자 주소로 반복 발송하거나 Production API 키를 로컬 파일에 저장하지 않는다.
