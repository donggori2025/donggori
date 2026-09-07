# 작업자에게 전달할 Cursor 시작 프롬프트

저장소 루트를 Cursor에서 열고 새 Agent 대화에 아래 내용을 붙여 넣는다.
가이드와 규칙 파일도 함께 전달한다. 파일이 원격 main에 아직 없다면 별도로 전달/반영해야 하며, 없는 파일을 읽었다고 가정하면 안 된다.
아래 `[작업 내용]` 등을 채워 사용한다. 기본 권한은 로컬 수정·검증이며 원격 반영/배포는 포함하지 않는다.

```text
동고리 저장소의 기존 운영 기능과 보안 계약을 유지하며 다음 작업을 진행해줘.

[작업 내용]
여기에 구체적인 변경 요청을 적는다. 비어 있으면 구현하지 말고 무엇을 할지 질문해줘.

[허용 범위]
예: News 카드 간격·모바일 레이아웃·문구만 변경.
인증·DB·API 계약·추천 계산·환경변수·의존성·CI 변경은 포함하지 않음.

[현재 권한]
로컬 코드/문서 수정과 비파괴 검증만 허용.
원격 push/PR 생성/main merge/Production 배포/DB 쓰기/환경변수 변경은 아직 승인하지 않음.
추가 승인 시 해당 범위만 갱신할 것.

1. 먼저 다음을 실제로 읽어줘.
   - .cursor/rules/donggori-development.mdc
   - docs/development-workflow.md
   - docs/ui-safe-reapply-20260907.md
   - package.json, .github/workflows/verify.yml
   - 변경 대상 컴포넌트, 호출자, API, 관련 테스트
   파일이 없다면 임의로 과거 구현을 복원하지 말고 전달을 요청해줘.

2. 수정하기 전에 git status와 원격 origin/main 최신 SHA를 확인해줘.
   사용자 변경을 임의 삭제/stash/reset하지 말고, 새 작업은 최신 main에서 별도 브랜치로 시작해줘.
   기존 작업 브랜치라면 main과의 차이와 기존 변경의 목적부터 확인해줘.
   기록된 c174d2e는 2026-09-07 확인 지점이지 영구 고정 기준이 아니야.
   권한이 있으면 Vercel donggori-5yt3 프로젝트의 www.donggori.com 연결 배포 SHA도 확인해줘.
   main과 Production이 다르거나 접근할 수 없다면 차이/미확인 사유를 보고해줘.

3. 우선 짧은 착수 보고를 남겨줘.
   기준 main SHA / 현재 HEAD / 브랜치 / Production 확인 상태,
   읽은 파일과 현재 동작, 바꿀 것과 유지할 것,
   재사용할 경로, 환경·DB 영향, 검증 계획을 적어줘.
   범위가 명확하면 그 계획에 따라 진행하고, 범위 확장이나 기준 충돌이 있으면 먼저 질문해줘.

4. 과거 PR·ZIP·대화의 파일 전체를 덮어쓰지 말고 필요한 변경만 옮겨줘.
   최신 main 위에 오래된 파일을 덮어써도 회귀가 생긴다는 점을 주의해줘.
   누락 import를 해결하려고 폐기된 모듈을 복원하지 말고 삭제 이유와 현재 대체 경로를 확인해줘.

5. 반드시 유지해줘.
   - npm/Next.js 및 기존 lockfile. Bun/Vite로 전환 금지.
   - factoryCatalog → /api/factories → 서버 Supabase 구조.
   - useAppAuth와 /api/auth/me 기반 로그인 상태, 서버 세션과 문의 접근 권한.
   - 카카오·네이버 소셜 로그인, OAuth state와 안전한 redirect.
   - 기존 공장 이미지 해석과 placeholder, 실제 데이터 기반 배지·추천.
   - metadata/canonical, 공장·공지 상세 sitemap, 모바일과 한글 IME 처리.
   이메일/SendGrid 로그인·공장 로그인·공개 문의 업로드·브라우저 직접 DB 접근,
   하드코딩 공장/품질 보증·고정 업체 가산점·무작위 추천·강제 결과 지연은 복원하지 마.
   서버 비밀키를 NEXT_PUBLIC 변수로 옮기거나 .env 값을 채팅/소스/로그에 출력하지 마.

6. 작은 변경 단위마다 이유와 검증을 문서나 작업 기록에 남겨줘.
   코드 작업 완료 후 npm run verify, npm run test:functional,
   node --experimental-strip-types --test scripts/ui-refresh.test.mjs를 실행해줘.
   환경값이 없어 실패하면 누락 변수명과 미검증 범위를 보고하고 보안 검사를 우회하지 마.
   공개 CI용 테스트 값으로 통과한 빌드는 실제 Supabase/OAuth 검증과 구분해줘.
   실제 사용자 데이터에 쓰는 SQL/seed/import/upload/문의 테스트는 승인 없이 실행하지 마.

7. 원격 반영이 승인되면 PR 전 main을 다시 확인하고 최종 HEAD diff를 검토해줘.
   main이 바뀌었으면 통합한 코드로 다시 검증해줘. 이전 SHA의 테스트 성공을 재사용하지 마.
   Preview에서도 영향받는 화면·실제 데이터·이미지·로그인 진입을 확인하되 보호 설정을 풀지 마.
   최종 보고에는 변경점, 유지한 구조, 테스트 결과/미검증 항목, 위험, 다음 작업을 구분해줘.
   배포 승인을 받기 전에는 main merge나 Production 배포를 하지 마.
```

## 작업자에게 보내는 짧은 전달 문구

```text
동고리는 PR #10에서 UI를 선별해 정상 구조로 배포한 상태입니다.
예전 작업 폴더나 PR 파일을 덮어쓰지 말고, 원격 main 최신 코드를 먼저 읽어주세요.
함께 전달한 development-workflow.md와 Cursor 규칙을 확인하고,
cursor-start-prompt.md에 이번 작업 범위를 적어 새 Cursor 대화에서 시작해주세요.
착수 시 기준 SHA·변경 범위·유지할 기능을 먼저 공유하고,
검증 결과와 남은 위험을 보고한 뒤 운영 반영은 별도 승인받아주세요.
```
