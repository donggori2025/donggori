# 결제·작업지시서 워크플로우 (feature/payment-workflow)

크몽형 거래 흐름을 동고리에 맞게 구현한 기능 브랜치입니다.

## 브랜치

`feature/payment-workflow`

## DB 마이그레이션

Supabase SQL Editor에서 실행:

```
docs/db-payment-workflow.sql
```

생성 테이블:

- `work_orders` — 작업지시서·거래 상태
- `work_order_messages` — 거래 채팅
- `work_order_payments` — 작업 대금 / 퀵 배송비 계좌이체
- `factory_notifications` — 공장 사장님 도착 알림

## 거래 흐름

1. **작업지시서 전달** → 공장 알림 생성
2. **공장 확인** → 채팅으로 협의·수정
3. **검토 요청 / 승인 / 수정 요청**
4. **작업 대금 계좌 입금** → 관리자 입금 확인
5. **샘플 작업 / 바로 제작** 선택 → 작업 진행
6. **작업 완료** → 수령 방법 선택
   - 직접 방문 수령
   - 퀵 배송 (고정 배송비 계좌 입금 → 관리자 확인 → 공장 발송)
7. **구매 확정** → 거래 완료

## 주요 화면

| 경로 | 대상 |
|------|------|
| `/my-page/work-orders` | 의뢰자 거래 목록 |
| `/my-page/work-orders/[id]` | 의뢰자 거래실 (채팅·결제·수령) |
| `/factory-my-page/work-orders` | 공장 사장님 작업지시서함 (태블릿) |
| `/factory-my-page/work-orders/[id]` | 공장 거래실 |
| `/admin/work-orders` | 관리자 입금 확인 |

## API

- `GET/POST /api/work-orders`
- `GET /api/work-orders/[id]`
- `POST /api/work-orders/[id]/actions`
- `GET/POST /api/work-orders/[id]/messages`
- `GET /api/work-orders/[id]/payments`
- `GET/PUT /api/factory/notifications`

## 작업지시서 생성 예시

```ts
POST /api/work-orders
{
  "user_email": "user@example.com",
  "user_name": "홍길동",
  "factory_id": "57",
  "factory_name": "스마일 1",
  "title": "봉제 작업지시서",
  "description": "티셔츠 100장",
  "amount": 500000,
  "work_order_json": {
    "품목": "티셔츠",
    "수량": "100",
    "납기": "2026-09-01"
  }
}
```

## 환경 변수

`env.example`의 결제·퀵 배송 계좌 항목을 설정하세요.

## 후속 작업

- [ ] 기존 `match_requests` 의뢰 완료 시 `work_orders` 자동 생성
- [ ] 공장 로그인 시 `factory_session` 쿠키 통일
- [ ] 알림톡/SMS 연동 (작업지시서 도착)
- [ ] PG 연동 (토스 등) — 현재는 계좌이체 MVP
