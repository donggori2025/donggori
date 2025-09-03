## 동고리 신규 프로젝트 기능정의서 (동일 스펙 + 가입/로그인 개선 + 카카오 알림톡 의뢰 전달)

본 문서는 현재 서비스와 동일한 기능을 새로운 프로젝트에 이식하기 위한 기능정의서입니다. 기존 기능을 그대로 유지하되, 회원가입/로그인 플로우를 개선하고, 디자이너의 작업지시서 의뢰 시 공장 사장님에게 카카오톡(알림톡)으로 정보를 전달하는 신규 기능을 포함합니다. 문서는 Cursor 프로젝트 간 복사/붙여넣기로 바로 활용 가능하도록 구성했습니다.

### 1. 기술 스택 및 공통 규격
- **런타임/패키지**: Bun (bun.lock 관리), Node.js 호환 실행
- **웹 프레임워크**: Next.js(App Router) + React + TypeScript
- **스타일**: Tailwind CSS, shadcn/ui 컴포넌트(`components/ui`)
- **데이터**: PostgreSQL(+ Prisma), Supabase(클라이언트/스토리지)
- **인증**:
  - OAuth: 카카오, 네이버 (기존 라우트 유지: `app/api/auth/kakao`, `app/api/auth/naver` 등)
  - 세션/유저관리: Clerk 기반 세션 미들웨어 + 커스텀 OAuth 연동 보조 (`lib/clerkConfig.ts`, `middleware.ts`)
- **자원 저장**: Vercel Blob(이미지/문서 업로드) + Supabase Storage 선택 사용
- **지도**: 네이버 지도 SDK (`components/NaverMap.tsx` 등)
- **배포/환경**: Vercel 기준, `.env`로 환경변수 주입

권장 Node/Bun 명령 예시: `bun install`, `bun dev`, `bun run build`, `bun run start`

### 2. 사용자 역할
- **디자이너(일반 사용자)**: 공장 탐색, 의뢰(작업지시서 업로드), 문의, 마이페이지 정보 관리
- **봉제공장(사장님)**: 공장 정보 등록/수정, 의뢰 수신(카카오 알림톡), 의뢰 관리
- **관리자**: 대시보드, 공장/공지/팝업 관리, 회원 관리, 통계

### 3. 핵심 기능 개요 (현행 동일 유지)
- 랜딩/소개/가격/FAQ/이용약관/개인정보 처리방침 페이지
- 공장 목록/상세/지도 보기, 추천 섹션
- 과정/강좌 목록/상세(있을 경우)
- 의뢰/작업지시서 업로드, 의뢰 내역 조회
- 마이페이지: 프로필, 문의, 의뢰 내역
- 공지사항 목록/상세
- 관리자: (대시보드, 공장/공지/팝업 CRUD 등)

### 4. 회원가입/로그인 플로우 개선 (소셜 → 일반폼 보완 입력)

#### 4.1 목표
소셜 회원가입 시 제공된 정보를 기반으로 일반 회원가입 폼을 미리 채우고, 누락 정보(예: 휴대폰 번호)를 추가 입력/인증 완료 후에만 최종 가입을 완료합니다.

#### 4.2 상태 모델
- `UNREGISTERED`: 미가입
- `PENDING_PROFILE`: 소셜 로그인 완료, 일반폼에 미반영 정보 존재
- `PENDING_PHONE_VERIFICATION`: 휴대폰 번호 미인증
- `ACTIVE`: 모든 필수 정보 충족 및 인증 완료
- `BLOCKED`: 차단/탈퇴 상태

#### 4.3 데이터 필드(필수/선택)
- 필수: 이름, 이메일, 휴대폰 번호, 이용약관/개인정보 동의
- 선택: 성별, 생년, 회사/브랜드, 역할(디자이너/공장/기타), 마케팅 수신 동의
- 시스템: `phoneVerifiedAt`, `socialProvider`, `socialId`, `profileCompletedAt`

#### 4.4 UX 플로우
1) 사용자가 소셜 로그인(카카오/네이버) 선택 → OAuth 콜백 수신
2) 서버는 소셜 프로필로 `PENDING_PROFILE` 유저 세션 발급
3) 클라이언트에서 일반 회원가입 폼을 소셜 데이터로 프리필
4) 누락 정보 입력 유도 (예: 휴대폰 번호)
5) 휴대폰 인증(OTP) 진행 → 성공 시 `phoneVerifiedAt` 기록, 상태 `PENDING_PHONE_VERIFICATION` → `ACTIVE` 전환 조건 충족
6) 모든 필수 입력 + 인증 완료 시 최종 가입 확정(`ACTIVE`) 및 정상 세션 유지

#### 4.5 API/라우팅 (권장 설계)
- `POST /api/auth/oauth-callback` → 소셜 콜백 통합 처리, 세션 발급, 유저 상태 `PENDING_PROFILE` 생성/갱신
- `POST /api/auth/signup/complete` → 일반폼 최종 제출, 필드 검증, 상태 전환(`ACTIVE`)
- `POST /api/auth/phone/request` → 휴대폰 인증 OTP 발송 (알림톡/문자)
- `POST /api/auth/phone/verify` → OTP 검증, 성공 시 `phoneVerifiedAt` 기록

요청/응답 예시
```json
// POST /api/auth/phone/request
{
  "phone": "+821012345678",
  "purpose": "signup"
}

// POST /api/auth/phone/verify
{
  "phone": "+821012345678",
  "code": "123456"
}

// POST /api/auth/signup/complete
{
  "name": "홍길동",
  "email": "user@example.com",
  "phone": "+821012345678",
  "agreements": {"tos": true, "privacy": true}
}
```

#### 4.6 검증 규칙
- 이메일 형식/중복 체크, 전화번호 국제형식(E.164) 정규화
- OTP 유효시간(예: 5분), 시도 제한(예: 5회)
- 동의 필수 항목 미체크 시 에러

#### 4.7 보안/세션
- OAuth 이후 미완성 회원은 제한된 리소스만 접근 허용
- 최종 가입 시 서버 세션/Clerk 세션 동기화
- 민감정보 최소 보관, 전송 구간 TLS, 비정상 시도 레이트리밋

### 5. 작업지시서 의뢰 시 카카오 알림톡 발송 (신규)

#### 5.1 목표
디자이너가 작업지시서를 업로드하고 의뢰하기를 누르면, 공장 사장님의 휴대폰 번호로 카카오 알림톡을 전송합니다. 메시지에는 디자이너 정보(전화번호 포함)와 작업지시서 확인 링크가 포함됩니다. 카카오 알림톡 실패 시 SMS로 폴백합니다.

#### 5.2 전송 시점
- 이벤트: `의뢰 생성` 혹은 `의뢰 상세에서 의뢰하기 버튼 클릭`
- 중복 전송 방지: 동일 의뢰ID에 대해 아이들포텐시 키 적용

#### 5.3 데이터 모델(추가/확장)
- `WorkOrder`(또는 `MatchRequest`)에 필드 추가
  - `id`, `designerUserId`, `factoryId`, `fileUrl`, `title`, `content`, `status(REQUESTED|SENT|DELIVERED|FAILED)`
- `MessageLog`
  - `id`, `workOrderId`, `channel(ALIMTALK|SMS)`, `to`, `payload`, `status(SENT|DELIVERED|FAILED)`, `error`, `createdAt`

#### 5.4 API/서버 처리
- `POST /api/requests/:id/notify-factory`
  - 권한: 의뢰 작성자 또는 관리자
  - 처리: 의뢰/공장/디자이너 정보 로드 → 메시지 구성 → 알림톡 전송 → 결과 로깅 → 실패 시 SMS 폴백

요청/응답 예시
```json
// POST /api/requests/wo_123/notify-factory
{
  "force": false
}

// 200 OK
{
  "ok": true,
  "channel": "ALIMTALK",
  "messageLogId": "ml_456"
}
```

#### 5.5 메시지 구성
- 템플릿(예시)
  - 제목: "동고리 의뢰 도착"
  - 본문: "[의뢰ID {id}] 디자이너 {name}({phone})가 작업지시서를 보냈습니다. 확인: {shortUrl}"
  - 버튼: "작업지시서 보기"(단축 URL)
- 파일 첨부는 링크로 제공(Vercel Blob/Supabase Storage 업로드 후 퍼블릭 혹은 서명 URL)

#### 5.6 카카오 알림톡 연동 (프로바이더 추상화)
- 권장: 카카오 비즈메시지(알림톡) 대행사 연동(Toast Cloud BizMessage, Naver Cloud BizMessage 등)
- 인터페이스
  - `MessagingProvider.sendAlimtalk(to, templateId, variables)`
  - `MessagingProvider.sendSMS(to, text)` (폴백)
- 환경변수
  - `BIZMSG_PROVIDER` ("toast" | "ncloud" 등)
  - `BIZMSG_APP_KEY`, `BIZMSG_SECRET`, `BIZMSG_SENDER_KEY`, `BIZMSG_SENDER_NUMBER`

샘플 페이로드(예시: Toast Bizmessage)
```json
{
  "recipientList": [{"recipientNo": "01012345678", "templateParameter": {"id": "wo_123", "name": "홍길동", "phone": "01012345678", "shortUrl": "https://dg.li/wo_123"}}],
  "senderKey": "${BIZMSG_SENDER_KEY}",
  "templateCode": "DG_REQUEST",
  "message": "[의뢰ID #{id}] 디자이너 #{name}(#{phone})가 작업지시서를 보냈습니다. 확인: #{shortUrl}"
}
```

#### 5.7 실패 처리/재시도
- 전송 실패 시 SMS 즉시 폴백(`sendSMS`)
- 재시도 정책: 지수백오프 최대 3회, 최종 실패 시 관리자 알림
- `MessageLog`에 모든 시도 이력 저장

### 6. UI/페이지 매핑 (현행 유지 + 보완)
- `app/sign-in/page.tsx`: 소셜 로그인 버튼 → 콜백 후 보완입력 폼으로 라우팅
- `app/sign-up/page.tsx`: 일반폼(소셜 프리필 반영), 휴대폰 인증 섹션 포함
- `app/sso-callback/page.tsx` 또는 `app/api/auth/*`: 소셜 콜백 처리
- `app/work-order/page.tsx`(또는 `app/matching/page.tsx`): 작업지시서 업로드, 의뢰 전송 버튼
- `components/OAuthCallbackHandler.tsx`: 콜백 처리 클라이언트 헬퍼
- `components/ImageUpload.tsx`: 파일 업로드 공통 컴포넌트 재사용
- 관리자 섹션: `app/admin/*` 그대로 유지

### 7. 데이터베이스/스키마 변경 요약(Prisma 예시)
- `User` 테이블에 필드 추가: `phone`, `phoneVerifiedAt`, `profileCompletedAt`, `socialProvider`, `socialId`
- `WorkOrder`(또는 기존 `MatchRequest`) 확장: `fileUrl`, `status`
- `MessageLog` 신규 테이블: 전송 이력 관리

마이그레이션 가이드
- 신규 프로젝트에서 Prisma 스키마 반영 → `bun run prisma migrate deploy`

### 8. 환경변수(.env) 목록
- 일반
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URL` (PostgreSQL)
  - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- 인증
  - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI`
  - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NAVER_REDIRECT_URI`
- 저장소
  - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- 휴대폰 인증/메시징
  - `BIZMSG_PROVIDER`, `BIZMSG_APP_KEY`, `BIZMSG_SECRET`, `BIZMSG_SENDER_KEY`, `BIZMSG_SENDER_NUMBER`

### 9. 보안/정책
- 알림톡 템플릿은 사전 심사/승인 필수, 템플릿변수만 동적 치환
- 개인정보 최소 수집/가명처리, 다운로드 가능한 작업지시서는 만료형 서명 URL 권장
- 레이트리밋/CSRF 보호, 중요 API는 서버 전용 처리

### 10. QA 체크리스트
- 소셜 → 보완입력 폼 프리필 정상동작
- 휴대폰 OTP 요청/검증, 실패/재시도 동작
- 보완입력 완료 후 `ACTIVE` 상태 전환 및 재로그인 없이 이용 가능
- 의뢰 생성 → 알림톡 발송 → 로그 기록/실패 시 SMS 폴백 확인
- 관리자에서 메시지 로그/의뢰 상태 확인 가능

### 11. 신규 프로젝트 적용 가이드
1) 동일 리포를 복제하거나 새 Cursor 프로젝트에 본 문서를 포함
2) Bun 기반으로 의존성 설치: `bun install`
3) `.env` 작성(8장 참고), 데이터베이스 준비 후 `bun run prisma migrate deploy`
4) OAuth/알림톡 대행사 콘솔에 콜백/템플릿 등록
5) 개발 서버: `bun dev`로 구동 후 플로우 점검

### 12. 인터페이스 요약 (개발 참고)
- 전화 인증
  - `POST /api/auth/phone/request` { phone, purpose }
  - `POST /api/auth/phone/verify` { phone, code }
- 가입 완료
  - `POST /api/auth/signup/complete` { 필수필드... }
- 알림톡 전송
  - `POST /api/requests/:id/notify-factory` { force? }

본 문서는 기존 서비스 동등 기능을 전제하며, 회원가입/로그인 완결성 및 의뢰 전달 신뢰성을 강화하기 위한 변경사항만 추가 정의합니다.


