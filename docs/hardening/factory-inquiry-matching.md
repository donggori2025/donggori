# 공장 공개·문의·추천 흐름 정리

## 완료

- 공개 공장 목록과 상세는 브라우저 Supabase 쿼리 대신 `/api/factories` API만 사용한다.
- 공개 API는 연락처·이메일·상세 주소·공장별 카카오 URL을 제외하고, DB의 `image`/`images` 값만 반환한다. 지도 좌표는 동 단위 탐색만 가능하도록 소수 둘째 자리로 낮추며, 정확한 작업장 위치로 안내하지 않는다.
- 공장 이미지는 업체명과 하드코딩 Blob 파일 목록으로 조합하지 않는다. DB 행의 이미지 URL만 사용한다.
- 좌표가 없는 공장은 동대문 중심점으로 임의 표시하지 않는다. 지도에는 유효한 좌표가 있는 공장만 표시한다.
- 공장 문의와 디자인 문의는 로그인 세션의 사용자 ID·이메일, DB에서 재확인한 공장명, 서버 시간을 사용해 저장한다. 본문에서 받은 사용자 ID, 상태, 공장명, 타임스탬프는 신뢰하지 않는다.
- 공장·디자인 의뢰의 브라우저 Storage 업로드를 제거했다. 첨부파일은 접수 뒤 동고리 중앙 오픈채팅에 직접 보낸다.
- 공장별 알림 URL 호출을 의뢰 흐름에서 제거했다. 공장 로그인이 없는 현재 운영 방식과 맞지 않는다.
- 추천 점수는 사용자가 선택한 조건 전체를 분모로 계산한다. 공장 데이터가 비어 있다고 점수가 부풀려지지 않으며, 0점 결과를 무작위 공장으로 대체하지 않는다.
- 특정 공장(박원니트)을 니트 검색에서 100점/첫 번째로 고정하던 코드를 제거했다.
- 사용자 화면의 `AI 매칭`, `70+ 인증`, `TOP 100` 같은 검증 불가 문구를 `맞춤 추천` 및 사실 기반 문구로 바꿨다.
- 지도는 공개 API가 반환한 유효 좌표만 표시하며, 기본 공장·주소 추정 좌표를 사용하지 않는다.
- 공개 팝업 API는 표시용 필드만 반환하고, 팝업 이동 URL은 `http` 또는 `https`만 허용한다. 화면에서도 같은 검증을 한 번 더 수행한다.
- 지도 팝업의 공정 태그는 공장 ID로 임의 생성하지 않고 DB의 `factory_type`·`business_type` 값만 표시한다.

## 검증

- `npx tsc --noEmit` 통과.
- `node --experimental-strip-types --test scripts/factory-matching.test.mjs` 통과 (3/3: 특정 공장 고정 100점 제거, 0점 무작위 추천 방지, 30점 미만 결과 채우기 방지).

## 배포 전 운영 확인

1. Supabase의 `donggori.image`/`donggori.images`에 실제 공개 가능한 HTTPS 이미지 URL만 유지한다.
2. `match_requests`에 `user_id`, `user_email`, `user_name`, `factory_id`, `factory_name`, `status`, `items`, `quantity`, `description`, `contact`, `deadline`, `budget`, `additional_info`, `created_at`, `updated_at` 컬럼이 있어야 한다.
3. 중앙 오픈채팅 URL은 `lib/site.ts`의 `DONGGORI_OPEN_KAKAO_CHAT_URL` 한 곳에서 관리한다.
4. 예전 `/api/requests/:id/notify-factory`와 공장별 알림톡/SMS 자동발송 경로는 제거 완료됐다. 현재 문의는 동고리 중앙 오픈채팅으로만 안내하며 자동 발송을 재도입하려면 개인정보·수신 동의·수신자 검증·발송 이력 정책을 별도 설계한다.
