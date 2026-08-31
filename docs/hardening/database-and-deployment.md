# Supabase 보안 적용 및 배포 순서

## 이번 변경의 역할 분리

- 브라우저: 동고리의 `/api/*`만 호출한다. Supabase 애플리케이션 테이블을 직접 조회하거나 수정하지 않는다.
- Vercel 서버: `SUPABASE_SERVICE_ROLE_KEY`로 필요한 행만 조회하고 공개 응답 필드를 제한한다.
- Supabase: RLS와 권한 회수로 `anon`, `authenticated` 역할의 직접 접근을 차단한다.

코드와 DB 차단은 한 쌍이다. DB부터 잠그면 아직 Supabase를 직접 호출하는 구 버전 프런트가 고장 나므로 아래 순서를 지켜야 한다.

## 운영 적용 순서

1. Supabase Dashboard의 Database Backups에서 최신 백업 시각과 복구 가능 여부를 확인한다.
2. **코드 배포 전**, Supabase SQL Editor에서 아래 호환 마이그레이션을 순서대로 실행한다.
   1. `supabase/migrations/20260828_sessions.sql` — 해시 ID를 저장하는 서버 세션 테이블과 사용자별 폐기 인덱스를 보장한다.
   2. `supabase/migrations/20260828_social_identity_unique.sql` — 카카오·네이버 제공자 ID 중복을 검사하고 사용자 간 중복 연결을 막는 유니크 인덱스를 추가한다. 기존 중복이 있으면 삭제하지 않고 중단하므로 계정을 먼저 검토한다.
   3. `supabase/migrations/20260828_email_otp_verify_attempts.sql` — 이메일 OTP의 `verify_attempts` 컬럼과 음수 방지 제약을 추가한다. OTP 5회 실패 제한은 이 컬럼이 있어야 작동한다. `email_otps` 테이블 자체가 없는 신규 환경이면 먼저 `scripts/create-email-otps-table.sql`을 적용한다.
   4. `supabase/migrations/20260828_notice_visibility.sql` — `notices.is_active` 및 공개 기간 컬럼/인덱스를 추가한다.
3. Vercel Preview에 이 브랜치를 배포하고 필수 환경변수가 모두 설정됐는지 확인한다.
4. Preview에서 이메일·카카오·네이버 로그인, OTP 5회 실패 차단, 공장 목록/상세, 문의 등록/조회, 공지/팝업, 관리자 CRUD를 점검한다.
5. 같은 코드를 Vercel Production에 배포한다.
6. Production에서 위 핵심 흐름을 다시 한 번 점검한다.
7. **Production 서버 API가 정상 동작하는 것을 확인한 뒤에만**, Supabase SQL Editor에서 `supabase/migrations/20260828_lock_down_app_tables.sql`을 실행한다. 이 단계는 브라우저의 애플리케이션 테이블 직접 접근을 차단한다.
8. SQL 마지막의 확인 결과에서 모든 대상 테이블이 `rowsecurity=true`, `policy_count=0`, `anon_can_select=false`, `authenticated_can_select=false`인지 확인한다.
9. 시크릿 창에서 핵심 흐름을 다시 점검하고 Vercel Function Logs에 `permission denied`가 없는지 확인한다.

## 실행 전 필수 Vercel 환경변수

- `NEXT_PUBLIC_SITE_URL=https://www.donggori.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `NEXT_PUBLIC_NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- 이메일 인증 발송에 사용하는 공급자 키와 발신 주소

Preview와 Production 값은 각각 설정한다. OAuth **client ID**는 브라우저 OAuth 시작 URL에 포함되므로 위의 `NEXT_PUBLIC_*_CLIENT_ID` 이름을 사용한다. `SUPABASE_SERVICE_ROLE_KEY`, 세션 비밀키, OAuth secret은 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

## Vercel WAF 최소 규칙

- `/api/admin/login`: 동일 IP의 실패 시도를 15분에 5회 수준으로 제한하고 이후 challenge 또는 차단한다.
- `/api/auth/login`, `/api/auth/email/request`, `/api/auth/email/verify`: IP별 짧은 구간 요청률과 반복 실패를 제한한다. OTP 발송은 이메일 주소별 제한도 함께 둔다.
- Preview에서 정상 로그인·OTP 흐름이 차단되지 않는지 확인한 뒤 Production에 같은 규칙을 적용한다.
- 코드 내부 메모리 제한은 여러 Vercel 인스턴스에 공유되지 않으므로 WAF나 외부 지속형 제한의 대체가 아니다.

## SQL 적용 후 확인 쿼리

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select
  has_table_privilege('anon', 'public.users', 'select') as anon_users,
  has_table_privilege('anon', 'public.donggori', 'select') as anon_factories,
  has_table_privilege('authenticated', 'public.match_requests', 'select') as authenticated_requests;
```

세 값은 모두 `false`여야 한다. 공장·공지·팝업의 공개 조회는 테이블 권한이 아니라 서버 API를 통해 계속 제공된다.

## 별도 수동 정리

- 저장소 첫 커밋부터 추적된 SSH 개인키 파일을 이번 브랜치에서 삭제했다. Git 이력에는 과거 내용이 남으므로 해당 키를 **유출된 것으로 간주해 즉시 폐기·재발급**한다. 새 키가 실제 배포·GitHub·서버 어디에 등록됐는지 확인한 뒤 기존 공개키 등록도 제거한다. 필요하면 운영 중단 시간을 정해 별도 이력 정리 작업을 수행하되, 이 브랜치에서는 공유 이력을 강제 재작성하지 않는다.
- Supabase Storage의 `match-request-files` 버킷에 과거 작업지시서가 남아 있다면 먼저 백업·보존 기준을 정한 뒤 public 설정을 끄고, 만료된 파일을 삭제한다. 이 마이그레이션은 사용자 파일을 자동 삭제하지 않는다.
- 더 이상 사용하지 않는 `factory_auth`, `message_logs`, `phone_otps` 테이블은 코드에서 참조가 사라진 것을 배포 후 확인한 다음, 백업을 거쳐 별도 변경으로 삭제한다. 이번 마이그레이션은 복구 가능성을 위해 잠그기만 한다.
- 기존에 노출됐을 가능성이 있는 service role/OAuth/Vercel 토큰은 코드 수정과 별개로 교체하고 Vercel의 Preview/Production 값을 함께 갱신한다.

## 롤백

문제가 나면 먼저 Vercel을 직전 정상 배포로 되돌린다. 구 버전이 Supabase 직접 조회에 의존한다면 DB 권한 복구가 필요하지만, 전체 공개 정책을 임의로 되살리지 말고 해당 API를 수정한 뒤 재배포하는 것을 우선한다. 긴급 복구가 필요한 경우에도 정확한 대상 테이블과 최소 `SELECT` 권한만 한시적으로 부여하고 종료 시 회수한다.
