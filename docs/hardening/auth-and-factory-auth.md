# 인증 및 공장 로그인 정리

## 완료

- 브라우저 인증 상태는 `AuthContext`가 `/api/auth/me`에서만 읽는다. `kakao_user`, `naver_user`, `isLoggedIn`, `userType`, localStorage 값은 권한 판단에 쓰지 않는다.
- `/api/auth/me`는 서버 세션을 검증한 뒤 `users`의 공개 프로필 필드만 반환한다.
- 이메일·소셜 로그인 뒤 `next`는 `/`로 시작하고 `//`가 아닌 내부 경로만 허용한다. OAuth 왕복 중에는 HttpOnly 쿠키에 보관한다.
- 카카오/네이버는 provider external ID가 정확히 일치할 때만 기존 계정으로 로그인한다. 이메일만 같은 계정은 자동 연동·덮어쓰지 않고 `account_link_required`로 안내한다.
- 소셜 가입 임시 이름·이메일·프로필을 JavaScript가 읽는 쿠키에 보관하지 않는다. 서명된 HttpOnly `signup_proof`를 `/api/auth/signup-context`가 확인해 필요한 가입 문맥만 반환한다.
- `supabase/migrations/20260828_social_identity_unique.sql`로 `(signupMethod, externalId)` 중복 연결을 막고, 가입 API도 사전 중복 확인과 DB 유니크 충돌을 409로 처리한다.
- `PATCH /api/auth/profile`는 로그인 사용자 자신의 이름과 전화번호만 검증 후 저장한다.
- 실제 자동 메시지 기능이 없으므로 가입 화면의 마케팅·카카오 메시지 수신 동의와 `kakaoMessageConsent` 저장을 제거했다.
- 새 세션은 DB에 원문 토큰 대신 SHA-256 해시를 저장한다. 이메일 OTP도 `email_otps.code`에 SHA-256 해시만 저장한다.
- 가입·변경·재설정 비밀번호의 최소 길이를 10자로 통일했다. 변경 또는 재설정 성공 시 해당 사용자의 모든 앱 세션과 현재 브라우저의 앱 세션 쿠키를 폐기한다.
- OTP의 `verify_attempts`가 없거나 갱신되지 않으면 인증을 실패 처리한다. `supabase/migrations/20260828_email_otp_verify_attempts.sql`을 코드 배포 전에 적용한다.
- 로그인 화면·헤더에서 공장 로그인과 브라우저 측 로그인 플래그 생성을 제거했고, 공장 마이페이지·공장 API·공장 세션/인증 모듈을 제거했다.

## 검증

- `scripts/security-regression.test.mjs`에 내부 `next` 경로 검증, `/api/auth/me` 단일 소스, 공장 로그인 제거 정적 회귀 검사를 추가했다.
- 같은 회귀 테스트는 비밀번호 최소 길이, 모든 세션 폐기 호출, OTP 시도 횟수 fail-closed, 세션 해시 저장도 검사한다.

## 배포 영향 및 운영 확인

- 세션과 OTP 저장값이 해시로 바뀌므로 배포 시 기존 로그인 세션과 아직 쓰지 않은 OTP는 무효화된다. 안내 후 배포한다.
- `email_otps.verify_attempts` 마이그레이션도 적용해야 한다. 미적용 상태에서는 OTP 인증이 의도적으로 실패한다.
- OAuth 제공자 콘솔의 callback URL은 기존 `https://www.donggori.com/api/auth/{kakao|naver}/callback`을 유지한다.
- 공장 로그인·세션을 소비하던 `match-requests`, 공장 이미지 수정 권한 분기, matching의 localStorage 로그인 판정은 모두 제거했다. 배포 전 정적 회귀 테스트로 `factory_session`, `factoryAuth`, `role === "factory"`가 다시 생기지 않았는지 확인한다.
- 이메일만 같은 소셜 계정은 자동 연결하지 않는다. 향후 명시적 계정 연동 기능이 필요하면 로그인 재확인과 제공자 소유권 검증을 포함해 별도 설계한다.
