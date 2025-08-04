# 동고리 (Donggori) - 의류 디자이너-봉제공장 매칭 플랫폼

의류 디자이너와 봉제공장을 연결하는 AI 기반 매칭 플랫폼입니다.

## 🚀 주요 기능

- **AI 매칭**: 디자이너의 요구사항에 맞는 최적의 봉제공장 추천
- **공장 검색**: 지역별, 업태별 봉제공장 검색 및 지도 시각화
- **의뢰 관리**: 디자이너의 의뢰 내역 및 공장의 의뢰 접수 관리
- **실시간 알림**: 매칭 상태 및 의뢰 진행 상황 실시간 알림
- **결제 시스템**: 안전한 결제 처리 (Toss Payments 연동)

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리

### Backend & Database
- **Supabase** - PostgreSQL 기반 백엔드 서비스
- **Clerk** - 사용자 인증 및 권한 관리
- **Vercel Blob Storage** - 이미지 저장소

### External Services
- **Naver Maps API** - 지도 서비스
- **Toss Payments** - 결제 시스템

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/donggori.git
cd donggori
```

### 2. 의존성 설치
```bash
bun install
```

### 3. 환경 변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 환경 변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk 인증 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Naver Maps 설정
NEXT_PUBLIC_NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# Vercel Blob Storage 설정
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### 4. 개발 서버 실행
```bash
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🏗️ 프로젝트 구조

```
donggori/
├── app/                    # Next.js App Router
│   ├── factories/         # 공장 관련 페이지
│   ├── matching/          # AI 매칭 페이지
│   ├── my-page/          # 사용자 마이페이지
│   ├── factory-my-page/  # 공장 마이페이지
│   └── ...
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── ...
├── lib/                  # 유틸리티 및 설정
│   ├── hooks/            # 커스텀 훅
│   ├── types.ts          # TypeScript 타입 정의
│   ├── utils.ts          # 유틸리티 함수
│   └── ...
└── public/               # 정적 파일
```

## 🔧 개발 가이드

### 코드 스타일
- **ESLint**: 코드 품질 및 일관성 유지
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안전성 보장

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 성능 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 분할**: 동적 임포트로 번들 크기 최적화
- **캐싱**: 적절한 캐싱 전략 적용
- **SEO**: 메타데이터 및 구조화된 데이터 최적화

## 🚀 배포

### Vercel 배포 (권장)
1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

### 수동 배포
```bash
bun build
bun start
```

## 📊 모니터링 및 분석

- **Vercel Analytics**: 웹사이트 성능 모니터링
- **Sentry**: 에러 추적 및 성능 모니터링
- **Google Analytics**: 사용자 행동 분석

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**동고리** - 의류 디자이너와 봉제공장을 연결하는 플랫폼