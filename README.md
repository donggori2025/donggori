# 동고리 (Donggori) - 봉제공장 매칭 플랫폼

봉제공장과 의류 제작 의뢰자를 연결하는 플랫폼입니다.

## 주요 기능

- 🏭 봉제공장 검색 및 필터링
- 📋 공정 의뢰 시스템
- 👤 봉제공장 마이페이지
- 💬 실시간 의뢰 관리

## 시작하기

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 설정을 추가하세요:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ 중요: Supabase 환경 변수가 설정되지 않으면 "공장 이미지 조회 중 오류"가 발생할 수 있습니다.**

환경 변수 설정 후에는 개발 서버를 재시작해야 합니다.

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `donggori` 테이블 생성 (봉제공장 정보)
3. `match_requests` 테이블 생성 (의뢰 내역)
4. `factory_auth` 테이블 생성 (공장 인증)

### 3. 개발 서버 실행

```bash
# Bun 사용 (권장)
bun dev

# 또는 다른 패키지 매니저
npm run dev
# yarn dev
# pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 데이터베이스 스키마

### donggori 테이블 (봉제공장 정보)
```sql
CREATE TABLE donggori (
  id SERIAL PRIMARY KEY,
  company_name TEXT,
  admin_district TEXT,
  phone_number TEXT,
  business_type TEXT,
  factory_type TEXT,
  moq INTEGER,
  monthly_capacity INTEGER,
  top_items_upper TEXT,
  top_items_lower TEXT,
  top_items_outer TEXT,
  top_items_dress_skirt TEXT,
  top_items_bag TEXT,
  top_items_fashion_accessory TEXT,
  top_items_underwear TEXT,
  top_items_sports_leisure TEXT,
  top_items_pet TEXT,
  sewing_machines TEXT,
  pattern_machines TEXT,
  special_machines TEXT,
  main_fabrics TEXT,
  processes TEXT,
  delivery TEXT,
  distribution TEXT,
  intro TEXT,
  description TEXT,
  kakao_url TEXT,
  lat DECIMAL,
  lng DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### match_requests 테이블 (의뢰 내역)
```sql
CREATE TABLE match_requests (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  factory_id TEXT,
  factory_name TEXT,
  status TEXT DEFAULT 'pending',
  items TEXT[],
  quantity INTEGER,
  description TEXT,
  contact TEXT,
  deadline TEXT,
  budget TEXT,
  additional_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: Bun
- **Deployment**: Vercel

## 개발 가이드

### Supabase 연결 문제 해결

1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트 URL과 Anon Key 확인
3. 데이터베이스 테이블이 생성되었는지 확인
4. RLS (Row Level Security) 설정 확인

### 데이터 로딩

- Supabase 연결이 실패하면 하드코딩된 샘플 데이터를 사용
- 연결 상태는 페이지 상단에 표시됩니다

## 라이센스

MIT License