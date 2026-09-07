import { supabase } from './supabaseClient';
import { FactoryLocation, MapFilters } from './types';
import { getFactoryLocationByName } from './factoryLocations';

// 기본 공장 위치 데이터 (임시)
const defaultFactoryLocations: FactoryLocation[] = [
  {
    id: "1",
    company_name: "재민상사",
    position: { lat: 37.5665, lng: 126.9780 },
    address: "서울특별시 동대문구 장한로34길 23-2",
    business_type: "봉제업",
    image: "/logo_donggori.png"
  },
  {
    id: "2", 
    company_name: "우정패션",
    position: { lat: 37.5668, lng: 126.9785 },
    address: "서울특별시 동대문구 장한로34길 25",
    business_type: "봉제업",
    image: "/logo_donggori.png"
  },
  {
    id: "3",
    company_name: "우진모피", 
    position: { lat: 37.5662, lng: 126.9775 },
    address: "서울특별시 동대문구 장한로34길 21",
    business_type: "봉제업",
    image: "/logo_donggori.png"
  }
];

export async function getFactoryLocations(filters?: MapFilters): Promise<FactoryLocation[]> {
  try {
    // Supabase에서 공장 데이터 가져오기 (주소 기반)
    let query = supabase
      .from('donggori')
      .select('id, company_name, address, business_type, image, lat, lng');

    // 필터 적용
    if (filters?.region) {
      query = query.ilike('address', `%${filters.region}%`);
    }

    if (filters?.businessType) {
      query = query.ilike('business_type', `%${filters.businessType}%`);
    }

    const { data, error } = await query;

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 공장 위치 데이터 가져오기에 실패했습니다:', error);
      }
      return defaultFactoryLocations;
    }

    // 주소 기반으로 좌표 매핑 (희망사 제외)
    const factoriesWithLocation = (data as any[])
      .filter((factory: any) => {
        // 희망사 제외
        if (factory.company_name === "희망사") {
          return false;
        }
        
        const hasAddress = factory.address;
        if (!hasAddress && process.env.NODE_ENV === 'development') {
          console.log(`⚠️ 주소 없음: ${factory.company_name} (ID: ${factory.id})`);
        }
        return hasAddress;
      })
      .map((factory: any) => {
        // 공장명으로 정확한 위치 정보 먼저 확인
        const exactLocation = getFactoryLocationByName(factory.company_name);
        
        let position;
        if (exactLocation) {
          // 정확한 위치 정보가 있으면 사용
          position = { lat: exactLocation.lat, lng: exactLocation.lng };
        } else {
          // 없으면 주소 기반으로 좌표 계산 (우편번호 제거)
          const cleanAddress = removePostalCode(factory.address);
          position = getPositionFromAddress(cleanAddress);
        }
        
        return {
          id: factory.id,
          company_name: factory.company_name,
          position,
          address: factory.address,
          business_type: factory.business_type,
          image: factory.image
        };
      })
      .filter((factory: any) => factory.position.lat !== 0 && factory.position.lng !== 0);

    if (factoriesWithLocation.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ 유효한 주소가 없어 기본 데이터 사용');
      }
      return defaultFactoryLocations;
    }
    
    return factoriesWithLocation;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 공장 위치 데이터 가져오기 중 오류가 발생했습니다:', error);
    }
    return defaultFactoryLocations;
  }
}

// 우편번호를 제거하는 함수
function removePostalCode(address: string): string {
  // 우편번호 패턴 제거 (02로 시작하는 5자리 숫자)
  return address.replace(/02\d{3}\s*/, '').trim();
}

// 주소를 좌표로 변환하는 함수 (실제 위치 기반)
function getPositionFromAddress(address: string): { lat: number; lng: number } {
  // 동대문구 실제 위치 정보 (더 정확한 매핑)
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    // 장안동 (동대문구)
    '장안동': { lat: 37.5665, lng: 126.9780 },
    '장한로': { lat: 37.5665, lng: 126.9780 },
    '장한로34길': { lat: 37.5665, lng: 126.9780 },
    '장한로34길 23-2': { lat: 37.5665, lng: 126.9780 },
    '장한로34길 25': { lat: 37.5668, lng: 126.9785 },
    '장한로34길 21': { lat: 37.5662, lng: 126.9775 },
    
    // 답십리동
    '답십리': { lat: 37.5668, lng: 126.9785 },
    '답십리동': { lat: 37.5668, lng: 126.9785 },
    '답십리1동': { lat: 37.5668, lng: 126.9785 },
    '답십리2동': { lat: 37.5671, lng: 126.9789 },
    
    // 신설동/용두동
    '신설동': { lat: 37.5772, lng: 127.0256 },
    '용두동': { lat: 37.5730, lng: 127.0370 },
    
    // 제기동
    '제기동': { lat: 37.5669, lng: 126.9772 },
    
    // 청량리동
    '청량리': { lat: 37.5672, lng: 126.9778 },
    '청량리동': { lat: 37.5672, lng: 126.9778 },
    
    // 회기동
    '회기동': { lat: 37.5675, lng: 126.9782 },
    
    // 이문동
    '이문동': { lat: 37.5678, lng: 126.9788 },
    
    // 전농동
    '전농동': { lat: 37.5681, lng: 126.9792 },
    
    // 동대문구 전체
    '동대문구': { lat: 37.5665, lng: 126.9780 },
    '서울특별시 동대문구': { lat: 37.5665, lng: 126.9780 },
  };

  // 주소에서 지역명 추출
  const addressLower = address.toLowerCase();
  
  // 가장 구체적인 매칭부터 시도
  for (const [key, position] of Object.entries(locationMap)) {
    if (addressLower.includes(key.toLowerCase())) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📍 주소 매핑: "${address}" -> "${key}" (${position.lat}, ${position.lng})`);
      }
      return position;
    }
  }
  
  // 기본값 (동대문구 중심)
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚠️ 주소 매핑 실패: "${address}" -> 기본값 사용`);
  }
  return { lat: 37.5665, lng: 126.9780 };
}

// 특정 공장의 위치 정보 가져오기
export async function getFactoryLocation(factoryId: string): Promise<FactoryLocation | null> {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, address, business_type, image, lat, lng')
      .eq('id', parseInt(factoryId)) // factoryId를 숫자로 변환
      .single();

    if (error || !data) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ 공장 정보 없음: ID ${factoryId}`);
      }
      return null;
    }

    // 희망사인 경우 null 반환
    if (data.company_name === "희망사") {
      return null;
    }

    // 주소가 있는 경우 주소 기반으로 좌표 계산
    if (data.address) {
      // 공장명으로 정확한 위치 정보 먼저 확인
      const exactLocation = getFactoryLocationByName(data.company_name);
      
              let position;
        if (exactLocation) {
          // 정확한 위치 정보가 있으면 사용
          position = { lat: exactLocation.lat, lng: exactLocation.lng };
        } else {
          // 없으면 주소 기반으로 좌표 계산 (우편번호 제거)
          const cleanAddress = removePostalCode(data.address);
          position = getPositionFromAddress(cleanAddress);
        }
      
      return {
        id: data.id,
        company_name: data.company_name,
        position,
        address: data.address,
        business_type: data.business_type,
        image: data.image
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ 주소 없음: ${data.company_name} (ID: ${factoryId})`);
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 공장 위치 정보 가져오기 중 오류가 발생했습니다:', error);
    }
    return null;
  }
} 