# 동고리 하드닝 최종 감사

> 기준일: 2026-08-28. 코드 수정과 독립 누락 감사를 마친 결과다. 이 문서는 코드 준비 완료를 뜻하며, 운영 자격 증명 교체·DB 적용·Preview 검증·Production 배포 완료를 뜻하지 않는다.

## 코드에서 해결한 배포 차단 항목

- 브라우저 `localStorage`·일반 쿠키를 로그인이나 권한 근거로 사용하던 공장 상세·문의·매칭·마이페이지 흐름을 서버 세션으로 통일했다.
- 공장 문의는 `/api/match-requests`에 로그인 사용자와 DB 공장 정보를 서버에서 다시 확인해 저장한다. 사용자 본문의 ID·상태·공장명·타임스탬프는 신뢰하지 않는다.
- 실제 서버 처리가 없던 탈퇴 완료, 카카오 수신 동의, 프로필 사진 변경 UI와 하드코딩 문의 목록을 제거했다.
- 사용하지 않는 공장 로그인·대시보드·세션·이미지 수정·공장 알림톡/SMS 경로를 제거했다. 공장은 관리자가 등록하고 사용자는 중앙 오픈채팅으로 상담한다.
- OAuth state·내부 `next` 경로·동일 이메일 계정 자동 연결을 보강하고, 비밀번호 정책을 10자로 통일했다. 변경·재설정 뒤에는 해당 사용자의 모든 앱 세션을 폐기한다.
- 세션 ID와 OTP 코드는 원문 대신 SHA-256 해시를 저장한다. OTP 실패 횟수 컬럼이 없거나 갱신되지 않으면 인증을 실패 처리한다.
- 공개 공장·공지·팝업 API는 허용 필드만 반환한다. 상세 주소·연락처·이메일·공장별 카카오 URL·원문 DB 오류를 공개 응답에서 제외했고, 지도 좌표는 소수 둘째 자리로 낮춰 건물 단위 위치가 드러나지 않게 했다.
- 임의 공장·좌표·이미지, 특정 공장 점수 고정, 0점 무작위 결과, 30점 미만 결과 채우기, `AI`·`70+`·`TOP` 같은 검증 불가 문구를 제거했다.
- 관리자 공장·공지·팝업 입력 검증, 피드백 소유권·입력 검증, 보안 헤더, 오류 화면, canonical·OG·sitemap·private route noindex를 보강했다.
- Google Fonts 빌드 네트워크 의존성과 사용하지 않는 production 의존성을 제거하고 CI 검증 명령을 추가했다.

## 최종 검증 결과

| 항목 | 결과 | 비고 |
|---|---|---|
| `npm run test:security` | 통과 (4/4) | 인증·세션·OTP·공장 로그인 제거 정적 회귀 |
| factory matching test | 통과 (3/3) | 고정 점수·0점 랜덤·저점 채우기 방지 |
| `npm run typecheck` | 통과 | TypeScript 오류 없음 |
| `npm run lint` | 통과 | 오류 0, 기존 경고는 별도 백로그 |
| `npm run build` | 통과 | 안전한 CI용 필수 환경변수로 production build 확인 |
| `npm audit --omit=dev` | 통과 | `0 vulnerabilities` |
| `git diff --check` | 통과 | 공백·충돌 표식 오류 없음 |

실제 OAuth 제공자 왕복, SendGrid 발송, Supabase 운영 데이터, Vercel WAF는 로컬 검증으로 대체할 수 없으므로 Preview에서 확인해야 한다.

## 운영 적용 순서

1. 저장소 이력에 노출된 SSH 개인키를 유출로 간주해 폐기·재발급하고 GitHub·배포 서버의 등록 키를 교체한다. 연관된 service role/OAuth/Vercel 자격 증명도 노출 범위를 확인해 회전한다.
2. Supabase 백업 시각과 복구 가능 여부를 확인한다.
3. 코드 배포 전에 `20260828_sessions.sql` → `20260828_social_identity_unique.sql` → `20260828_email_otp_verify_attempts.sql` → `20260828_notice_visibility.sql` 순서로 적용한다.
4. Vercel Preview/Production에 필수 환경변수를 분리 설정하고 로그인·OTP 엔드포인트 WAF 규칙을 추가한다.
5. Preview에서 이메일·카카오·네이버 로그인, OTP 5회 실패, 공장 목록/상세, 문의 등록/조회, 공지/팝업, 관리자 CRUD를 확인한다.
6. 같은 커밋을 Production에 배포하고 핵심 흐름을 재확인한다.
7. 서버 API 정상 동작 확인 뒤에만 `20260828_lock_down_app_tables.sql`을 적용한다. 확인 쿼리에서 RLS 활성화·정책 0개·`anon`/`authenticated` 권한 회수를 검증한다.
8. 시크릿 창과 Vercel Function Logs에서 `permission denied`와 인증 회귀가 없는지 확인한다.

상세 명령과 롤백 원칙은 [database-and-deployment.md](./database-and-deployment.md)를 단일 기준으로 사용한다.

## 배포 후 별도 운영 과제

- `match-request-files` Storage bucket의 public 설정, 접근 정책, 보존 기간과 기존 작업지시서 삭제 기준을 확정한다. 사용자 파일은 이번 코드가 자동 삭제하지 않는다.
- 과거 Blob 이미지의 고아 파일은 참조 여부와 복구 정책을 확인한 뒤 별도 승인으로 삭제한다.
- `factory_auth`, `message_logs`, `phone_otps` 같은 잠긴 레거시 테이블은 배포 안정화 후 백업을 거쳐 별도 마이그레이션으로 제거한다.
- Supabase anon key에 의존하는 과거 일회성 스크립트는 운영 DB에서 실행하지 않는다. 필요하면 service-role 기반 관리자 도구로 명시적으로 전환한다.
- lint의 기존 경고는 보안 배포와 분리한 품질 백로그로 관리한다.
- 개인정보 처리방침의 수집 항목·목적·보유기간·국외 처리 내용은 실제 Vercel·Supabase·이메일 공급자 운영 구성에 맞춰 법률 검토 후 확정한다.

## 감사 결론

확인된 코드 차원의 P0/P1 누락은 반영됐다. Production 전환을 막는 남은 항목은 코드가 아니라 **키 교체, Supabase 마이그레이션 적용, Vercel 환경변수·WAF, Preview 실연동 검증**이다. 이 네 가지를 완료하기 전에는 Production 배포 승인으로 간주하지 않는다.
