# 동고리 개발 작업 가이드

작성: 2026-09-07. 대상: 동고리 작업자와 Cursor Agent.

목적은 **현재 승인된 기능·보안 구조를 이해한 뒤 필요한 변경만 추가하는 것**이다.
이 문서는 모든 버그가 해결됐다는 보증이나 Production 배포 승인이 아니다.

## 1. 먼저 확인할 기준

| 항목 | 작성 시점에 확인한 값 |
| --- | --- |
| 저장소 | `https://github.com/donggori2025/donggori` |
| 기준 브랜치 | `main` |
| UI 선별 반영 및 운영 검증 커밋 | `c174d2e6dce89480a334688232ed7ff5d0669859` (PR #10 merge) |
| 운영 서비스 | `https://www.donggori.com` |
| Vercel 프로젝트 | `donggori-5yt3` |
| Vercel scope | `donggori2025-5337s-projects` |
| 배포 확인 기록 | [PR #10 운영 검증](https://github.com/donggori2025/donggori/pull/10#issuecomment-5568096526) |

이 SHA를 영구 고정하거나 이후 main을 되돌리지 않는다. 작업할 때마다 원격 main의 최신 SHA와 Vercel의 **현재 Production 도메인에 연결된 배포 SHA**를 다시 확인한다. 둘이 다르면 미배포 변경인지 rollback인지 확인하고 기준을 합의한다. Vercel 접근 권한이 없으면 배포 확인은 미완료로 보고한다. 프로젝트 이름이 비슷한 다른 Vercel 프로젝트를 선택하지 않는다.

### 읽는 순서

1. 이번 작업 요청의 목적·허용 범위·배포 권한.
2. 이 문서와 [UI 선별 반영 기록](ui-safe-reapply-20260907.md).
3. 최신 main의 `package.json`, `.github/workflows/verify.yml`, 변경 대상 코드와 호출자, 관련 테스트.
4. 필요한 경우 `docs/hardening/`과 `docs/hardening-implementation-log.md`에서 이전 결정의 이유.

`docs/handover/`, 과거 PDF·ZIP·PR·채팅, 환경변수 정리 기록은 **당시의 기록**이다. 예를 들어 과거 문서에 이메일 인증·공장 로그인이 있어도 현재 요구사항으로 해석하지 않는다. 문서와 코드가 다르면 차이와 근거를 보고하고, 보안 제약이나 제품 결정을 임의로 되돌리지 않는다.

## 2. 이번 회귀에서 배울 점

원래 UI PR에는 디자인뿐 아니라 과거의 데이터 접근·인증·추천 구현이 섞였다. 일부 화면은 브라우저용 Supabase 코드와 운영에서 제거한 공개 anon 키에 다시 의존하게 됐다. PR #10에서는 정상 main을 기준으로 디자인과 콘텐츠를 선별해 옮겼다.

**최신 main에서 브랜치를 만들었다는 사실만으로 충분하지 않다.** 그 위에 오래된 파일 전체를 덮어쓰면 같은 회귀가 발생한다. 다음을 지킨다.

- 디자인 참고와 코드 기반을 분리한다. 색상·간격·구성·자산만 필요한 단위로 옮긴다.
- 없는 모듈을 발견하면 먼저 왜 삭제됐는지 확인한다. 과거 모듈 복원으로 빌드만 통과시키지 않는다.
- 빌드는 테스트 환경값으로 통과할 수 있다. 실제 DB 연결·인증·이미지는 별도로 확인한다.
- UI 변경 중 인증, DB, API, 추천 알고리즘, 의존성 변경이 발생하면 범위가 늘어난 것이다. 먼저 승인받는다.

## 3. 작업 시작 절차

### 깨끗한 체크아웃인 경우

아래 브랜치 이름은 예시다. 실제 작업명으로 바꾼다.

```bash
git status --short --branch
git fetch origin main
git rev-parse origin/main
git log -8 --oneline origin/main
git switch --no-track -c codex/news-card-spacing origin/main
git rev-parse HEAD
```

- 첫 명령에서 변경 파일이 있으면 누구의 변경인지 확인한다. 임의 폐기·stash·다른 브랜치 이동을 하지 않는다.
- 기존 작업 브랜치를 계속 쓴다면 `git log --left-right --oneline origin/main...HEAD`와 `git diff --stat origin/main...HEAD`를 먼저 검토한다. 기존 변경의 작성자·목적을 확인한 뒤 병합/rebase 방법을 정한다.
- 비밀파일 제거 이전의 오래된 clone이라면 정리된 저장소를 새 폴더에 다시 clone하는 것을 우선한다. 오래된 브랜치·태그·이력을 다시 push하거나 `--mirror`하지 않는다. 기존 폴더는 임의 삭제하지 않는다.
- main을 fetch하지 못했으면 로컬이 최신이라고 말하지 않는다.

### 수정 전에 남길 짧은 보고

```text
작업 목적:
기준 origin/main SHA / 현재 HEAD / 작업 브랜치:
현재 Production SHA와 확인 근거 (또는 미확인 사유):
읽은 파일과 기존 동작:
변경할 것 / 유지할 것:
재사용할 API·인증·이미지·추천 경로:
환경변수·DB·배포 영향:
검증할 항목:
```

코드 내용을 실제로 읽고 근거 파일을 적는다. 전체 저장소를 무작정 출력하거나 `.env` 값을 보고서에 넣지 않는다.

## 4. 현재 유지해야 할 기능·보안 계약

| 영역 | 기존 경로·동작 | 승인 없이 되돌리면 안 되는 것 |
| --- | --- | --- |
| 런타임 | Next.js, npm, `package-lock.json`; CI는 Node 22, `npm ci` | Bun/Vite 전환, lockfile 교체, 빌드 도구 재구성 |
| 공장 조회 | `lib/factoryCatalog.ts` → `/api/factories` → 서버 Supabase | 과거 `lib/factories.ts`·`lib/supabaseClient.ts` 복원, 브라우저 직접 DB 조회 |
| 서버 DB | `lib/supabaseService.ts`의 서버 전용 클라이언트 | 공개키로 서버 비밀키 대체, 하드코딩 키·더미 클라이언트로 환경 오류 숨기기 |
| 로그인 표시 | `contexts/AuthContext.tsx`의 `useAppAuth()`와 `/api/auth/me` | localStorage·`isLoggedIn`·`kakao_user` 등 클라이언트 값만 믿는 인증 |
| 소셜 인증 | `/api/auth/oauth/start`, 서버 callback, `lib/oauthState.ts` | state 검증 생략, 임의 외부 redirect, 브라우저에서 세션 위조 |
| 세션·문의 | `lib/session.ts`, `lib/authHelpers.ts`, `lib/matchRequestAuth.ts`, `/api/match-requests` | 서버 세션 확인 생략, 타인 문의 접근, 요청 body의 사용자 식별값을 그대로 신뢰 |
| 로그인 범위 | 사용자 카카오·네이버 로그인; 관리자는 별도 관리자 인증 | 이메일/SendGrid 인증·공장 자체 로그인 재활성화 |
| 공장 이미지 | `lib/factoryImages.ts`, `useFactoryImages`, `FactoryImagePlaceholder` | 실제 DB 이미지 덮어쓰기, 임의 사진을 실제 업체 사진처럼 표시, 실패 이미지 처리 제거 |
| 공장 공개 정보 | `lib/factoryPrivacy.ts`와 공개 API의 필드 처리 | 개인정보·상세 위치 등 제한된 데이터 공개 확대 |
| 추천 | `lib/factoryMatching.ts`, 질문형 추천의 `takeMeaningfulMatches` | 특정 업체 고정 가산점, 무작위/저점수 업체로 3칸 채우기, 강제 1.8/2.2초 대기 |
| 마케팅 표현 | 실제 등록 정보와 확인된 근거로 설명 | ID로 임의 배지 생성, 인증 근거 없는 품질 보증·실적·기관 연계 단정 |
| 검색·공통 UI | metadata/canonical, 공장·공지 상세 sitemap, `SiteFrame` | 화면 교체와 함께 SEO 정보·상세 URL·관리자 화면 분리 삭제 |

현재 `SUPABASE_SERVICE_ROLE_KEY`라는 변수명을 사용해도 값은 새 `sb_secret_...` 형식일 수 있다. 이름을 보고 legacy JWT로 되돌리지 않는다. 이 키에는 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 운영 앱에 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없다는 이유로 추가하거나 브라우저 DB 구조를 복원하지 않는다. 환경별 실제 값은 관리자에게 확인하고 출력하지 않는다.

기존 문의·상담 흐름은 유지한다. UI 요청을 근거로 공개 첨부 업로드, 자동 카카오 발송, 결제 등 별도 기능을 끼워 넣지 않는다. 공장은 운영자가 등록하는 구조이며 공장용 로그인 신설은 별도 제품 결정이다.

## 5. 구현할 때

1. 변경할 컴포넌트의 import, 호출자, API, 응답 필드와 권한 검사를 따라 읽는다.
2. 기존 컴포넌트·유틸을 재사용한다. UI만 바꾸는 경우 className·표현 구조 중심의 작은 diff를 유지한다.
3. 로딩·빈 데이터·오류·이미지 실패·비로그인 상태를 각각 고려한다. 성공처럼 보이게 하는 샘플 데이터로 오류를 숨기지 않는다.
4. 모바일 가로 넘침, 메뉴/폼의 키보드 조작, 한글 조합 중 Enter, 중복 제출 방지를 확인한다.
5. 승인된 동작 변경은 관련 회귀 테스트도 추가/수정한다. 실패를 없애려고 기존 검사를 삭제하거나 조건을 느슨하게 하지 않는다.
6. 한 작업이 끝날 때 목적·변경 파일·이유·검증·남은 위험을 `docs/worklogs/날짜-작업명.md` 또는 PR 작업 기록에 남긴다. 완료하지 않은 검사는 완료 표시하지 않는다.

## 6. 검증: 자동 검사와 실제 동작을 분리한다

### 코드 변경 기본 검사

```bash
npm ci
npm run verify
npm run test:functional
node --experimental-strip-types --test scripts/ui-refresh.test.mjs
git diff --check
```

작성 시점의 `verify`는 **보안 테스트 + 타입검사 + lint를 포함한 build**이다. 기능/추천 테스트와 UI 검사는 위 명령으로 별도 실행해야 한다. GitHub 초록불 하나가 세 종류를 모두 실행했다는 뜻은 아니다. 이후 CI가 변경되면 실제 workflow를 다시 읽는다. 문서만 바꾼 PR은 링크·규칙 형식·diff 점검으로 범위를 줄일 수 있지만 코드 테스트를 실행했다고 적지 않는다.

### 환경값이 없을 때

- 로컬 build에 필요한 환경변수가 없으면 누락된 **변수명만** 보고한다. 관리자에게 새 키를 채팅에 붙이라고 요청하지 않는다.
- `.github/workflows/verify.yml`의 공개 CI 테스트 값은 해당 로컬 프로세스의 빌드 검사에만 사용할 수 있다. 실서비스용 `.env`/Vercel에 저장하거나 실제 인증·DB 검증 결과로 취급하지 않는다.
- 서버 검증을 제거하거나 legacy 키·더미 Supabase 연결을 추가하지 않는다.
- 운영 env pull, SQL/migration, seed/import/update/upload 스크립트는 별도 승인 없이 실행하지 않는다. 이름이 `test`/`check`여도 먼저 읽고 쓰기 동작이 있는지 확인한다.
- 같은 Supabase 프로젝트를 쓰는 Preview도 운영 데이터를 바꿀 수 있다. 로그인·문의 저장·삭제 테스트는 승인된 테스트 계정/데이터와 정리 계획이 있어야 한다.

### 실제 화면 확인표

변경 영향에 맞게 실행하고 각 항목에 SHA·환경·결과·증거를 기록한다.

- 홈: 실제 카드와 이미지, 조회 실패/빈 상태, 예시 입력에서 추천 이동.
- 공장: 검색·필터·상세·이미지 대체, 필요 시 지도.
- 추천: 의미 있는 조건의 결과, 무관한 입력의 빈 결과, 특정 업체 임의 우대 없음.
- 인증: 비로그인 문의는 로그인으로 이동, 카카오·네이버 시작 응답, 권한이 있는 테스트 계정의 callback/로그아웃.
- 관리자: 비로그인 `/admin`의 로그인 이동과 관리자 API 접근 차단; 관리자 동작은 승인된 계정으로만 확인.
- News·ESG·공지: 표시, 정렬/페이지 이동, 링크, 제목·canonical·sitemap.
- 반응형: 데스크톱 약 1280px, 모바일 약 390px, 가로 넘침·이미지 깨짐·콘솔/Network 오류.

Preview OAuth URL이 공급자에 등록되지 않았다면 원인을 미검증 사유에 적는다. 검사를 위해 callback/state 검증이나 Vercel Preview 보호를 해제하지 않는다. 로컬 UI 검사, Preview API 검사, 실제 운영 계정 검사는 서로 다른 증거다.

## 7. PR부터 배포까지

PR/배포 요청의 권한 범위부터 확인한다. 문서 작성이나 코드 수정 요청만으로 main 반영·운영 배포까지 승인됐다고 해석하지 않는다.

PR 준비 시:

```bash
git fetch origin main
git log --left-right --oneline origin/main...HEAD
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
git diff origin/main...HEAD -- app/api contexts lib middleware.ts next.config.ts package.json package-lock.json .github supabase
```

마지막 diff는 민감 경로의 검토용이며 무조건 빈 diff여야 한다는 뜻은 아니다. UI 요청에 불필요한 변화가 있으면 제외하고, 필요한 동작 변화면 근거·승인·테스트를 첨부한다. staging 후에는 `git diff --cached --check`와 `git diff --cached --name-status`도 확인한다. 비밀파일이나 사용자 자료가 섞이지 않도록 한다.

다른 사람이 main을 갱신했으면 변경을 읽고 통합 후 테스트를 다시 한다. 검증 후 코드가 달라졌으면 새 HEAD를 검증한다. 작성 시점 main은 보호 설정이 미적용 상태지만 직접 push/merge해도 된다는 뜻이 아니다.

### PR 본문 체크리스트

```text
목적 / UI·동작·환경 변경 구분:
기준 main SHA / 최종 HEAD SHA:
읽은 기존 구현과 유지한 계약:
변경 파일 및 이유:
환경변수·DB·개인정보·권한 영향 (없으면 없음):
실행한 검사, 결과, 실행하지 못한 검사와 이유:
Preview URL / 배포 SHA / 화면·API 확인 증거:
기존 승인 범위를 벗어난 변경 유무:
운영 반영 승인자 / 승인 범위 (미승인이면 미승인):
이상 발생 시 복구 대상 배포·커밋과 DB 호환성:
남은 작업:
```

별도 운영 반영 승인을 받은 뒤에만 main merge/Production 배포를 진행한다. `donggori-5yt3`의 Git 연동으로 main 변경이 자동 배포될 수 있으므로 문서 PR도 이를 고려한다. Preview 승격이 Production 환경값으로 재빌드된 것이라고 추정하지 말고 대상 환경과 배포 설정을 확인한다.

배포 완료는 다음을 모두 확인한 상태다: Vercel Ready, 현재 운영 도메인이 해당 배포를 가리킴, 배포 SHA 확인, 영향받는 화면·API smoke test, 배포 기록. 배포 요청만 보낸 상태를 완료로 보고하지 않는다. 장애가 나면 추가 무작정 수정을 중단하고 증거를 보존한 뒤 승인된 복구 절차를 따른다. DB를 바꾼 경우 코드 rollback만으로 복구된다고 가정하지 않는다.

## 8. 작업자에게 전달하는 방법

1. 이 가이드, `docs/cursor-start-prompt.md`, `.cursor/rules/donggori-development.mdc`를 전달한다.
2. 아직 공유 브랜치/main에 문서가 반영되지 않았다면 문서가 들어 있다고 가정하지 않는다. 담당자가 문서 PR을 별도로 반영하거나, 전달받은 파일을 해당 경로에 놓고 변경 상태를 확인한다. 자동으로 원격 main에 push하지 않는다.
   수동으로 파일을 전달하는 경우, 기존 `.cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc`가 남아 있는지도 확인한다. 이번 규칙은 해당 Bun 전환 지침을 대체한다. 기존 파일은 Git 이력에서 복구할 수 있으며, 서로 충돌하는 규칙을 동시에 활성화하지 않는다.
3. Cursor에서 저장소 루트를 열고 새 Agent 대화를 시작한다. 규칙이 인식되는지 확인하고 가이드를 파일로 첨부한다. 프롬프트의 작업 내용·범위·권한 칸을 채운다.
4. Agent가 먼저 기준 SHA와 읽은 코드, 유지할 동작을 보고하는지 확인한 후 진행 상황을 검토한다.

Cursor 규칙은 `.cursor/rules/*.mdc`와 `alwaysApply: true` 형식으로 작성했다. 규칙 파일을 공유 저장소에 포함하고 각 작업자가 갱신해야 전달된다. **문서/프롬프트는 사람의 검토·main 보호·required checks를 대신하지 못한다.** [Cursor 공식 규칙 문서](https://prod.cursor.com/docs/rules)

이번 문서 작업은 main 보호 설정이나 기능 테스트 CI 연결을 활성화하지 않는다. 해당 조치는 운영 배포 확인 이후 별도 승인·작업으로 진행한다.
