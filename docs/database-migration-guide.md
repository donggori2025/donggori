# 데이터베이스 마이그레이션 가이드

## 공지사항 테이블 마이그레이션

관리자 페이지에서 `image_urls` 컬럼을 찾을 수 없다는 오류가 발생하고 있습니다. 다음 SQL을 실행하여 문제를 해결하세요.

### 1. Supabase 대시보드에서 실행

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭
4. 다음 SQL을 실행:

```sql
-- 공지사항 테이블에 image_urls 컬럼 추가
ALTER TABLE notices ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 기존 데이터에 빈 배열로 초기화
UPDATE notices SET image_urls = '{}' WHERE image_urls IS NULL;
```

### 2. 카테고리 컬럼도 함께 추가 (선택사항)

공지사항에 카테고리 기능을 추가하려면 다음 SQL도 실행하세요:

```sql
-- 공지사항 테이블에 카테고리 필드 추가
ALTER TABLE notices ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT '공지';

-- 기존 데이터에 기본 카테고리 설정
UPDATE notices SET category = '공지' WHERE category IS NULL;

-- 카테고리 필드에 NOT NULL 제약 조건 추가
ALTER TABLE notices ALTER COLUMN category SET NOT NULL;
```

### 3. 마이그레이션 확인

마이그레이션이 완료되면 다음을 확인하세요:

1. 관리자 페이지에서 공지사항 목록이 정상적으로 로드되는지 확인
2. 새 공지사항 등록이 정상적으로 작동하는지 확인
3. 이미지 업로드 기능이 정상적으로 작동하는지 확인

### 4. 문제 해결

만약 여전히 오류가 발생한다면:

1. Supabase 대시보드에서 테이블 스키마 확인
2. 브라우저 캐시 클리어
3. 개발자 도구에서 네트워크 탭 확인하여 API 응답 상태 확인
