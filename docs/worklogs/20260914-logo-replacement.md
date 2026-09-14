# 2026-09-14 로고 이미지 교체

- 기준 main/운영 SHA: `6e9ae7ca3c34f383aa1fd62a6398b43785bc0a6d`. 원격 fetch 및 운영 Ready 배포 `dpl_FGPR4TsbFcMX13YjBLPyghztnBFN` 연결 확인.
- 작업 브랜치: `codex/logo-refresh-20260914`. 코드 교체와 로컬 검증 이후 사용자 후속 요청으로 push/병합/운영 배포 승인. 실제 배포 결과는 PR 후속 기록으로 남김.
- 사용자 첨부 JPG를 변경 없이 `public/logo_donggori_0914.jpg`에 복사. SHA-256: `8f316f65b61df5c119d161f35198772dbfa2d1c9674bb1cf4242e0ba7cfc1603` (첨부 원본과 동일).
- 헤더, 푸터, 회원가입, 공통 FactoryImagePlaceholder의 이미지 참조를 교체. 기존 표시 너비와 h-auto를 유지하고 원본 크기 798×266 및 반응형 sizes 지정. JPG의 흰 배경도 그대로 유지.
- 공통 대체 이미지를 사용하는 홈/검색/상세/추천 모두 같은 새 로고를 사용. 실제 공장 사진 및 기존 `/logo_donggori.png` fallback 판별 계약은 유지.
- 정사각형 심벌 파비콘과 생성기, 미사용 과거 로고 자산은 변경/삭제하지 않음. 인증/API/DB/env/의존성/CI 변경 없음.
- Node 22: npm ci, npm run verify(보안 4/4, typecheck, build 62 pages), 기능 5/5, UI 9/9 통과. lint 오류 0, 기존 경고 421개. 기존 npm audit 9개 항목은 이번 변경 대상 아님.
- 빌드는 CI 공개 테스트 환경값을 프로세스에 주입. 운영 환경값 다운로드 없음.
- 동일 빌드의 로컬 브라우저: 헤더·가입·푸터 새 로고 로딩/표시, 공장 80번 대체 로고, 390px 모바일 가입 화면 로고와 가로 넘침 없음 확인. 가입 화면 콘솔 오류 없음.
- 로컬 QA는 모든 쓰기를 차단하고 공개 공장 GET만 운영으로 전달한 루프백 프록시 사용. 실제 로그인/문의 저장 또는 배포 검증으로 간주하지 않음.
