# 네이버 지도 API 설정 가이드

## 🚨 중요: 네이버맵 API v3 마이그레이션

기존 네이버맵 API가 종료되어 새로운 **JavaScript API v3**를 사용해야 합니다.

## 1. 네이버 클라우드 플랫폼에서 API 키 발급

### 1.1 네이버 클라우드 플랫폼 가입
- [네이버 클라우드 플랫폼](https://www.ncloud.com/)에 가입
- 본인인증 및 결제수단 등록

### 1.2 Maps API 서비스 신청
1. 네이버 클라우드 플랫폼 콘솔에 로그인
2. **AI·NAVER API** → **Maps** 선택
3. **Maps** 서비스 신청 (JavaScript API v3)
4. 사용량에 따른 과금 정책 확인

### 1.3 Client ID 발급
1. **AI·NAVER API** → **Maps** → **Application** 메뉴로 이동
2. **Application 등록** 클릭
3. 애플리케이션 정보 입력:
   - **Application 이름**: 동고리 (또는 원하는 이름)
   - **Service Environment**: Web
   - **Web Service URL**: `http://localhost:3000` (개발용)
   - **Web Service URL**: `https://your-domain.com` (배포용)
4. **등록** 클릭
5. 발급받은 **Client ID** 복사

## 2. 환경 변수 설정

### 2.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# 네이버맵 API 설정
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-naver-map-client-id

# 기존 설정들...
BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
IMAGE_SERVICE=vercel-blob
```

### 2.2 실제 Client ID로 교체
`your-naver-map-client-id` 부분을 실제 발급받은 Client ID로 교체

### 2.3 개발 서버 재시작
환경 변수 변경 후 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
bun run dev
```

## 3. 문제 해결

### 3.1 "네이버맵 스크립트 로드 실패" 오류

**원인:**
- Client ID가 설정되지 않음
- 잘못된 Client ID
- 도메인이 등록되지 않음
- 네트워크 연결 문제

**해결 방법:**
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. Client ID가 올바르게 설정되었는지 확인
3. 네이버 클라우드 플랫폼에서 도메인 등록 확인
4. 개발 서버 재시작

### 3.2 도메인 등록 확인
네이버 클라우드 플랫폼에서 다음 도메인들이 등록되어 있는지 확인:
- 개발용: `http://localhost:3000`
- 배포용: 실제 도메인 URL

### 3.3 디버깅 정보 확인
브라우저 개발자 도구 콘솔에서 다음 정보를 확인:
- Client ID 길이
- 스크립트 URL
- 네트워크 상태
- 현재 도메인

## 4. 사용법

### 4.1 기본 사용법
```tsx
import NaverMap from '@/components/NaverMap';

<NaverMap
  center={{ lat: 37.5665, lng: 126.9780 }}
  level={8}
  className="w-full h-96"
/>
```

### 4.2 마커가 있는 지도
```tsx
import NaverMap from '@/components/NaverMap';

const markers = [
  {
    id: '1',
    position: { lat: 37.5665, lng: 126.9780 },
    title: '서울시청',
    onClick: () => console.log('마커 클릭')
  }
];

<NaverMap
  center={{ lat: 37.5665, lng: 126.9780 }}
  level={8}
  markers={markers}
  onMarkerSelect={(factory) => console.log(factory)}
/>
```

### 4.3 간단한 지도 (마커 없음)
```tsx
import SimpleNaverMap from '@/components/SimpleNaverMap';

<SimpleNaverMap
  center={{ lat: 37.5665, lng: 126.9780 }}
  level={8}
  className="w-full h-96"
/>
```

## 5. 주의사항

### 5.1 도메인 등록
- 개발 환경: `http://localhost:3000`
- 배포 환경: 실제 도메인 URL 등록 필요
- 등록되지 않은 도메인에서는 지도가 로드되지 않음

### 5.2 사용량 제한
- 무료 사용량: 월 1,000회 호출
- 초과 시 과금 발생
- 사용량 모니터링 권장

### 5.3 에러 처리
- API 키가 없거나 잘못된 경우 에러 메시지 표시
- 네트워크 연결 문제 시 대체 UI 표시
- 상세한 디버깅 정보 제공

## 6. 컴포넌트 Props

### NaverMap Props
- `center`: 지도 중심 좌표 (기본값: 동대문구)
- `level`: 줌 레벨 (기본값: 8)
- `markers`: 마커 배열
- `selectedMarkerId`: 선택된 마커 ID
- `onMapLoad`: 지도 로드 완료 콜백
- `onMarkerSelect`: 마커 선택 콜백
- `onLoadError`: 로드 실패 콜백
- `className`: CSS 클래스

### SimpleNaverMap Props
- `center`: 지도 중심 좌표
- `level`: 줌 레벨
- `className`: CSS 클래스

## 7. 마이그레이션 (카카오맵 → 네이버맵)

### 7.1 환경 변수 변경
```env
# 기존 (카카오맵)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-api-key

# 변경 후 (네이버맵)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-naver-client-id
```

### 7.2 컴포넌트 변경
```tsx
// 기존
import KakaoMap from '@/components/KakaoMap';
import SimpleKakaoMap from '@/components/SimpleKakaoMap';

// 변경 후
import NaverMap from '@/components/NaverMap';
import SimpleNaverMap from '@/components/SimpleNaverMap';
```

### 7.3 API 차이점
- 카카오맵: `window.kakao.maps`
- 네이버맵: `window.naver.maps`
- 마커 생성 방식이 다름
- 좌표계는 동일 (WGS84)

## 8. 테스트

### 8.1 테스트 페이지
`http://localhost:3000/test-map`에서 지도 기능을 테스트할 수 있습니다.

### 8.2 디버그 정보
테스트 페이지에서 다음 정보를 확인:
- 환경 변수 설정 상태
- Client ID 유효성
- API 상태
- 현재 도메인

## 9. 유용한 링크

- [네이버 클라우드 플랫폼](https://www.ncloud.com/)
- [네이버맵 API 문서](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html)
- [JavaScript API v3 가이드](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html)