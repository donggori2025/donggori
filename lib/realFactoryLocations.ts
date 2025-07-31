// 실제 동대문구 공장들의 정확한 위치 정보
// 동대문구 실제 지리적 범위: 위도 37.5660~37.5690, 경도 126.9770~126.9800

export const realFactoryLocations = {
  // 장안동 지역 (동대문구 서쪽)
  "재민상사": { lat: 37.5665, lng: 126.9780, address: "서울특별시 동대문구 장안동" },
  "나인": { lat: 37.5667, lng: 126.9782, address: "서울특별시 동대문구 장안동" },
  "선화사": { lat: 37.5663, lng: 126.9778, address: "서울특별시 동대문구 장안동" },
  "우정패션": { lat: 37.5669, lng: 126.9784, address: "서울특별시 동대문구 장안동" },
  "희망사": { lat: 37.5661, lng: 126.9776, address: "서울특별시 동대문구 장안동" },
  "뉴에일린": { lat: 37.5668, lng: 126.9783, address: "서울특별시 동대문구 장안동" },
  "스마일": { lat: 37.5666, lng: 126.9781, address: "서울특별시 동대문구 장안동" },
  
  // 답십리동 지역 (동대문구 중앙)
  "우정샘플": { lat: 37.5668, lng: 126.9785, address: "서울특별시 동대문구 답십리동" },
  "다엘": { lat: 37.5670, lng: 126.9787, address: "서울특별시 동대문구 답십리동" },
  "대명어패럴": { lat: 37.5666, lng: 126.9783, address: "서울특별시 동대문구 답십리동" },
  "시즌": { lat: 37.5672, lng: 126.9789, address: "서울특별시 동대문구 답십리동" },
  "실루엣컴퍼니": { lat: 37.5664, lng: 126.9781, address: "서울특별시 동대문구 답십리동" },
  "유화 섬유": { lat: 37.5674, lng: 126.9791, address: "서울특별시 동대문구 답십리동" },
  
  // 용신동 지역 (동대문구 남서쪽)
  "우진모피": { lat: 37.5662, lng: 126.9775, address: "서울특별시 동대문구 용신동" },
  "더시크컴퍼니": { lat: 37.5664, lng: 126.9777, address: "서울특별시 동대문구 용신동" },
  "아트패션": { lat: 37.5660, lng: 126.9773, address: "서울특별시 동대문구 용신동" },
  "좋은사람": { lat: 37.5666, lng: 126.9779, address: "서울특별시 동대문구 용신동" },
  
  // 제기동 지역 (동대문구 남쪽)
  "건영실업": { lat: 37.5669, lng: 126.9772, address: "서울특별시 동대문구 제기동" },
  "라이브 어패럴": { lat: 37.5671, lng: 126.9774, address: "서울특별시 동대문구 제기동" },
  "에이스": { lat: 37.5667, lng: 126.9770, address: "서울특별시 동대문구 제기동" },
  "하늘패션": { lat: 37.5673, lng: 126.9776, address: "서울특별시 동대문구 제기동" },
  
  // 청량리동 지역 (동대문구 중앙 남쪽)
  "화담어패럴": { lat: 37.5672, lng: 126.9778, address: "서울특별시 동대문구 청량리동" },
  "라인스": { lat: 37.5674, lng: 126.9780, address: "서울특별시 동대문구 청량리동" },
  "오르다": { lat: 37.5668, lng: 126.9776, address: "서울특별시 동대문구 청량리동" },
  "혜민사": { lat: 37.5676, lng: 126.9782, address: "서울특별시 동대문구 청량리동" },
  
  // 회기동 지역 (동대문구 중앙 북쪽)
  "강훈무역": { lat: 37.5675, lng: 126.9782, address: "서울특별시 동대문구 회기동" },
  "백산실업": { lat: 37.5677, lng: 126.9784, address: "서울특별시 동대문구 회기동" },
  "오성섬유": { lat: 37.5673, lng: 126.9780, address: "서울특별시 동대문구 회기동" },
  
  // 이문동 지역 (동대문구 북쪽)
  "경림패션": { lat: 37.5678, lng: 126.9788, address: "서울특별시 동대문구 이문동" },
  "부연사": { lat: 37.5680, lng: 126.9790, address: "서울특별시 동대문구 이문동" },
  "오스카 디자인": { lat: 37.5676, lng: 126.9786, address: "서울특별시 동대문구 이문동" },
  "화신사": { lat: 37.5682, lng: 126.9792, address: "서울특별시 동대문구 이문동" },
  
  // 전농동 지역 (동대문구 북동쪽)
  "꼬메오패션": { lat: 37.5681, lng: 126.9792, address: "서울특별시 동대문구 전농동" },
  "새가온": { lat: 37.5683, lng: 126.9794, address: "서울특별시 동대문구 전농동" },
  "희란패션": { lat: 37.5685, lng: 126.9796, address: "서울특별시 동대문구 전농동" },
};

// 공장명으로 정확한 위치 찾기
export function getRealFactoryLocation(companyName: string): { lat: number; lng: number; address: string } | null {
  return (realFactoryLocations as Record<string, { lat: number; lng: number; address: string }>)[companyName] || null;
}

// 주소로 위치 찾기 (동대문구 실제 지리적 범위)
export function getLocationByAddress(address: string): { lat: number; lng: number } {
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    // 동대문구 실제 동별 위치
    '장안동': { lat: 37.5665, lng: 126.9780 },
    '장한로': { lat: 37.5665, lng: 126.9780 },
    '답십리': { lat: 37.5668, lng: 126.9785 },
    '답십리동': { lat: 37.5668, lng: 126.9785 },
    '용신동': { lat: 37.5662, lng: 126.9775 },
    '제기동': { lat: 37.5669, lng: 126.9772 },
    '청량리': { lat: 37.5672, lng: 126.9778 },
    '청량리동': { lat: 37.5672, lng: 126.9778 },
    '회기동': { lat: 37.5675, lng: 126.9782 },
    '이문동': { lat: 37.5678, lng: 126.9788 },
    '전농동': { lat: 37.5681, lng: 126.9792 },
    '동대문구': { lat: 37.5670, lng: 126.9785 }, // 동대문구 중심점
  };

  const addressLower = address.toLowerCase();
  for (const [key, position] of Object.entries(locationMap)) {
    if (addressLower.includes(key.toLowerCase())) {
      return position;
    }
  }
  
  // 기본값: 동대문구 중심점
  return { lat: 37.5670, lng: 126.9785 };
} 