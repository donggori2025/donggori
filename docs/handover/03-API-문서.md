# 2-2. API 문서

## 공통 규격

### Base URL

| 환경 | URL |
|------|-----|
| 로컬 | `http://localhost:3000` |
| 프로덕션 | `https://www.donggori.com` (또는 Vercel 배포 URL) |

### 공통 응답 형식

```json
{
  "success": true,
  "data": { }
}
```

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (검증 실패) |
| 401 | 인증 필요 |
| 404 | 리소스 없음 |
| 429 | Rate limit (관리자 로그인) |
| 500 | 서버/DB 오류 |

---

## 인증 방식

### 1. 일반 사용자 (`session` 쿠키)

- 로그인: `POST /api/auth/login`
- OAuth: `GET /api/auth/kakao/callback`, `GET /api/auth/naver/callback`
- 세션 확인: `GET /api/auth/me`
- Supabase `sessions` 테이블 + HttpOnly 쿠키

### 2. 관리자 (`admin_session` 쿠키)

- 로그인: `POST /api/admin/login` — Body: `{ "id": "...", "password": "..." }`
- 환경변수: `ADMIN_ID`, `ADMIN_PW`, `ADMIN_SESSION_SECRET`
- Rate limit: 15분 5회 실패 시 차단
- 로그아웃: `POST /api/admin/logout`
- 보호: `lib/adminSession.ts` — `requireAdmin()` 미들웨어 패턴

### 3. 공장 사장님 (`factory_session` 쿠키)

- 로그인: `POST /api/factory/login`
- 정보: `GET /api/factory/me`
- 환경변수: `FACTORY_SESSION_SECRET` (미설정 시 ADMIN fallback)

### 4. 내부 API

- 헤더: `x-internal-auth: <INTERNAL_API_SECRET>`
- `lib/internalAuth.ts`

---

## 공개 API

### GET `/api/factories`

봉제공장 목록 (개인정보 마스킹).

**Response 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "company_name": "○○패션",
      "address": "서울특별시 동대문구 ...",
      "business_type": "봉제",
      "images": ["https://..."]
    }
  ]
}
```

### GET `/api/factories/[id]`

단일 업장 상세 (마스킹).

### GET `/api/notices`

활성 공지 목록.

### GET `/api/popups`

활성 팝업 목록 (기간·is_active 필터, slug 중복 제거).

---

## 인증 API (`/api/auth/*`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 이메일/비밀번호 또는 OTP 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| GET | `/api/auth/me` | 현재 사용자 |
| POST | `/api/auth/change-password` | 비밀번호 변경 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 |
| POST | `/api/auth/email/request` | 이메일 OTP 발송 |
| POST | `/api/auth/email/verify` | 이메일 OTP 검증 |
| POST | `/api/auth/check-user-type` | 사용자 유형 확인 |
| GET | `/api/auth/kakao/callback` | 카카오 OAuth |
| GET | `/api/auth/naver/callback` | 네이버 OAuth |
| POST | `/api/auth/sns/session` | SNS 세션 |

**로그인 Request 예시:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "********"
}
```

---

## 관리자 API (`/api/admin/*`)

> 모든 요청에 `admin_session` 쿠키 필요 (로그인 후 자동 설정).

### 인증·통계

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/admin/login` | 관리자 로그인 |
| POST | `/api/admin/logout` | 로그아웃 |
| GET | `/api/admin/stats` | 업장/공지/팝업 건수 |

### 업장 (`donggori`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/factories` | 목록 (희망사 제외) |
| POST | `/api/admin/factories` | 등록 |
| PUT | `/api/admin/factories/[id]` | 수정 |
| DELETE | `/api/admin/factories/[id]` | 삭제 |
| GET | `/api/admin/factories/schema` | DB 컬럼 스키마 |
| GET | `/api/admin/factories/export` | Excel(xlsx) 다운로드 |
| GET | `/api/admin/factories/images` | 이미지 목록 |
| POST | `/api/admin/factories/upload-image` | 이미지 업로드 |
| POST | `/api/admin/factories/delete-image` | DB 이미지 필드 삭제 |
| POST | `/api/admin/factories/delete-blob-image` | Blob 이미지 삭제 |

### 공지

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/notices` | 목록 |
| POST | `/api/admin/notices` | 등록 |
| PUT | `/api/admin/notices/[id]` | 수정 |
| DELETE | `/api/admin/notices/[id]` | 삭제 |

### 팝업

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/popups` | 목록 (조회 시 중복 정리) |
| POST | `/api/admin/popups` | 등록 |
| PUT | `/api/admin/popups/[id]` | 수정 |
| DELETE | `/api/admin/popups/[id]` | 삭제 |
| DELETE | `/api/admin/popups/bulk` | 일괄 삭제 `{ ids: [] }` 또는 `{ all: true }` |
| POST | `/api/admin/popups/dedupe` | 중복 행 정리 |
| POST | `/api/admin/popups/seed` | 기본 FADDIT 팝업 수동 등록 |

**팝업 등록 Request 예시:**
```json
POST /api/admin/popups
{
  "title": "이벤트",
  "image_url": "https://...",
  "link_url": "https://example.com",
  "link_url_mobile": "https://m.example.com",
  "start_at": "2026-06-01",
  "end_at": "2026-12-31",
  "is_active": true,
  "sort_order": 0
}
```

### 이미지

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/admin/upload-image` | 범용 이미지 업로드 |

---

## 공장 API (`/api/factory/*`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/factory/login` | 공장 로그인 |
| GET | `/api/factory/me` | 내 공장 정보 |
| POST | `/api/factory/update` | 정보 수정 |
| POST | `/api/factory/change-password` | 비밀번호 변경 |

---

## 매칭·의뢰 API

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/match-requests` | 작업지시서 생성 |
| GET | `/api/match-requests` | 목록 조회 |
| PUT | `/api/match-requests` | 상태 변경 |
| POST | `/api/requests/[id]/notify-factory` | 공장 알림톡/SMS 발송 |

---

## 이미지 API (`/api/factory-images/*`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/factory-images/url` | 이미지 URL 프록시 |
| GET | `/api/factory-images/list` | 폴더별 목록 |
| POST | `/api/factory-images/upload` | 업로드 |
| POST | `/api/factory-images/delete` | 삭제 |

---

## 피드백

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/feedback` | 매칭 피드백 저장 |
| GET | `/api/feedback` | 피드백 조회 |

---

## 에러 코드 정의 (관례)

| error 문자열 | 원인 |
|--------------|------|
| `제목은 필수입니다.` | 공지/팝업 검증 |
| `링크 URL은 http:// 또는 https:// 로 시작해야 합니다.` | 팝업 link_url |
| `서버 설정 오류` | Supabase env 미설정 |
| `인증이 필요합니다.` | 세션 없음/만료 |
| `로그인 시도 횟수 초과` | 관리자 rate limit |
| `삭제할 팝업을 찾을 수 없습니다.` | DELETE id 불일치 |

표준 HTTP status와 함께 `success: false`, `error` 문자열 반환.
