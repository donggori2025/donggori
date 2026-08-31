# 환경변수 정리 기록

기준 브랜치: `codex/donggori-hardening`

## 적용한 변경

- 운영 코드에서 참조하지 않는 `DATABASE_URL`, `IMAGE_SERVICE`, AWS S3 및 CloudFront 변수를 `env.example`에서 제거했다.
- 사용되지 않는 이미지 서비스, AWS 및 CloudFront 설정 객체를 `lib/config.ts`에서 제거했다.
- 비활성화된 Supabase JWT 키를 소스에 직접 포함하던 과거 일회성 관리 스크립트 5개를 제거했다.
- 설치되지 않은 AWS SDK와 폐기 대상 자격 증명을 요구하던 미사용 S3 업로드 스크립트를 제거했다.
- 사용되지 않는 Google OAuth 설정 절차와 폐기된 공개키 파일을 제거했다.
- SendGrid 환경변수는 이메일 OTP가 현재 참조하므로 이번 정리에서 유지했다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 운영 애플리케이션이 사용하지 않는다. 일부 과거 관리 스크립트만 참조하므로 Vercel에서는 제거 가능하며, 해당 스크립트는 별도 정리 대상으로 남겼다.

## Vercel에서 제거 가능한 변수

- Clerk 관련 변수
- Google OAuth 관련 변수
- 별도 OAuth redirect URI 변수
- `FACTORY_SESSION_SECRET`, `INTERNAL_API_SECRET`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`, `IMAGE_SERVICE`
- AWS S3, CloudFront, Cloudinary 관련 변수
- 과거 SMS, BizMessage, Solapi 및 Make webhook 관련 변수
- 현재 운영하지 않는 결제 및 배송 관련 변수

Vercel 변수 삭제는 Preview 검증 후 관리자 화면에서 수행한다.

## 검증 결과

- 현재 소스 트리에서 JWT, GitHub 토큰, Supabase secret key 및 개인키 패턴이 발견되지 않았다.
- 보안 회귀 테스트 4건을 통과했다.
- TypeScript 타입검사와 프로덕션 빌드를 통과했다.
- 운영 의존성 기준 `npm audit --omit=dev` 결과 취약점이 발견되지 않았다.
- 기존 ESLint 경고는 남아 있으나 이번 환경변수 정리에서 새 오류는 발생하지 않았다.

## 별도 보안 작업

- 오래된 원격 브랜치의 `.env`, 백업 및 토큰 파일 제거
- Git 전체 이력에서 비밀 파일 제거
- 노출됐던 외부 서비스 키 폐기 또는 재발급
