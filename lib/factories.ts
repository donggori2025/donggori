import { supabase } from "./supabaseClient";
import { getFactoryMainImage, getFactoryImages } from "./factoryImages";

export interface Factory {
  id: string;
  name: string;
  ownerUserId: string;
  region: string;
  items: string[];
  minOrder: number;
  description: string;
  image: string;
  images?: string[]; // 여러 장의 이미지 지원
  contact: string;
  lat: number;
  lng: number;
  kakaoUrl: string;
  processes: string[];
  // DB 연동용 확장 필드 (옵셔널)
  business_type?: string;
  equipment?: string;
  sewing_machines?: string;
  pattern_machines?: string;
  special_machines?: string;
  top_items_upper?: string;
  top_items_lower?: string;
  top_items_outer?: string;
  top_items_dress_skirt?: string;
  top_items_bag?: string;
  top_items_fashion_accessory?: string;
  top_items_underwear?: string;
  top_items_sports_leisure?: string;
  top_items_pet?: string;
  moq?: number;
  monthly_capacity?: number;
  admin_district?: string;
  intro?: string;
  phone_number?: string;
  factory_type?: string;
  main_fabrics?: string;
  distribution?: string;
  delivery?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  address?: string;
  established_year?: number;
  brands_supplied?: string;
  [key: string]: string | number | string[] | undefined;
}

// 10개의 샘플 이미지 URL
const sampleImages = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
];

// images 필드 랜덤 생성 함수
function getRandomImages(idx: number): string[] {
  // idx를 seed로 2~3개 고정적으로 뽑음
  const count = 2 + (idx % 2); // 2 또는 3개
  const start = idx % sampleImages.length;
  return Array.from({ length: count }, (_, i) => sampleImages[(start + i) % sampleImages.length]);
}

// 기존 factories 배열을 factoriesRaw로 이름 변경 (export X)
const factoriesRaw: Factory[] = [
  {
    id: "1",
    name: "서울패션공장",
    ownerUserId: "factory1",
    region: "서울",
    items: ["티셔츠", "셔츠", "원피스"],
    minOrder: 100,
    description: "서울 도심에 위치한 20년 경력의 봉제공장입니다.",
    image: "",
    images: [],
    contact: "02-1234-5678",
    lat: 37.5665,
    lng: 126.9780,
    kakaoUrl: "https://open.kakao.com/o/some-link1",
    processes: ["봉제", "나염"],
  },
  {
    id: "2",
    name: "부산의류제작소",
    ownerUserId: "factory2",
    region: "부산",
    items: ["바지", "점퍼"],
    minOrder: 200,
    description: "최신 설비와 숙련된 인력을 보유한 부산 봉제공장.",
    image: "",
    images: [],
    contact: "051-9876-5432",
    lat: 35.1796,
    lng: 129.0756,
    kakaoUrl: "https://open.kakao.com/o/some-link2",
    processes: ["샘플", "자수"],
  },
  {
    id: "3",
    name: "대구섬유공방",
    ownerUserId: "factory3",
    region: "대구",
    items: ["코트", "자켓"],
    minOrder: 50,
    description: "소량 생산도 가능한 대구의 섬유/봉제 전문 공방.",
    image: "",
    images: [],
    contact: "053-222-3333",
    lat: 35.8714,
    lng: 128.6014,
    kakaoUrl: "https://open.kakao.com/o/some-link3",
    processes: ["QC", "다이마루"],
  },
  {
    id: "4",
    name: "인천의류센터",
    ownerUserId: "factory4",
    region: "인천",
    items: ["셔츠", "바지"],
    minOrder: 120,
    description: "인천에서 다양한 의류를 생산하는 중형 공장입니다.",
    image: "",
    images: [],
    contact: "032-111-2222",
    lat: 37.4563,
    lng: 126.7052,
    kakaoUrl: "https://open.kakao.com/o/some-link4",
    processes: ["봉제", "나염"],
  },
  {
    id: "5",
    name: "광주패션하우스",
    ownerUserId: "factory5",
    region: "광주",
    items: ["원피스", "스커트"],
    minOrder: 80,
    description: "여성복 전문, 소량 주문도 환영합니다.",
    image: "",
    images: [],
    contact: "062-333-4444",
    lat: 35.1595,
    lng: 126.8526,
    kakaoUrl: "https://open.kakao.com/o/some-link5",
    processes: ["봉제", "나염"],
  },
  {
    id: "6",
    name: "대전의상공방",
    ownerUserId: "factory6",
    region: "대전",
    items: ["아우터", "점퍼"],
    minOrder: 150,
    description: "최신 설비로 고품질 아우터를 제작합니다.",
    image: "",
    images: [],
    contact: "042-555-6666",
    lat: 36.3504,
    lng: 127.3845,
    kakaoUrl: "https://open.kakao.com/o/some-link6",
    processes: ["봉제", "나염"],
  },
  {
    id: "7",
    name: "울산의류공장",
    ownerUserId: "factory7",
    region: "울산",
    items: ["티셔츠", "셔츠"],
    minOrder: 90,
    description: "울산 지역 소량/대량 모두 가능.",
    image: "",
    images: [],
    contact: "052-777-8888",
    lat: 35.5384,
    lng: 129.3114,
    kakaoUrl: "https://open.kakao.com/o/some-link7",
    processes: ["봉제", "나염"],
  },
  {
    id: "8",
    name: "경기어패럴",
    ownerUserId: "factory8",
    region: "경기",
    items: ["바지", "코트"],
    minOrder: 200,
    description: "경기도 최대 규모의 봉제공장.",
    image: "",
    images: [],
    contact: "031-888-9999",
    lat: 37.4138,
    lng: 127.5183,
    kakaoUrl: "https://open.kakao.com/o/some-link8",
    processes: ["봉제", "나염"],
  },
  {
    id: "9",
    name: "강원섬유",
    ownerUserId: "factory9",
    region: "강원",
    items: ["자켓", "셔츠"],
    minOrder: 60,
    description: "강원도에서 신속한 납기와 꼼꼼한 품질!",
    image: "",
    images: [],
    contact: "033-101-2020",
    lat: 37.8228,
    lng: 128.1555,
    kakaoUrl: "https://open.kakao.com/o/some-link9",
    processes: ["봉제", "나염"],
  },
  {
    id: "10",
    name: "충북패션",
    ownerUserId: "factory10",
    region: "충북",
    items: ["티셔츠", "스커트"],
    minOrder: 110,
    description: "충북 청주 중심의 봉제공장.",
    image: "",
    images: [],
    contact: "043-303-4040",
    lat: 36.6424,
    lng: 127.4890,
    kakaoUrl: "https://open.kakao.com/o/some-link10",
    processes: ["봉제", "나염"],
  },
  {
    id: "11",
    name: "충남의류센터",
    ownerUserId: "factory11",
    region: "충남",
    items: ["셔츠", "바지"],
    minOrder: 130,
    description: "충남 아산의 봉제공장, 빠른 납기 보장.",
    image: "",
    images: [],
    contact: "041-505-6060",
    lat: 36.7926,
    lng: 127.1350,
    kakaoUrl: "https://open.kakao.com/o/some-link11",
    processes: ["봉제", "나염"],
  },
  {
    id: "12",
    name: "전북패션공장",
    ownerUserId: "factory12",
    region: "전북",
    items: ["원피스", "블라우스"],
    minOrder: 90,
    description: "전북 전주에서 여성복 전문 생산.",
    image: "",
    images: [],
    contact: "063-606-7070",
    lat: 35.8242,
    lng: 127.1477,
    kakaoUrl: "https://open.kakao.com/o/some-link12",
    processes: ["봉제", "나염"],
  },
  {
    id: "13",
    name: "전남의상공방",
    ownerUserId: "factory13",
    region: "전남",
    items: ["아우터", "점퍼"],
    minOrder: 100,
    description: "전남 목포, 소량 생산도 환영.",
    image: "",
    images: [],
    contact: "061-808-9090",
    lat: 34.8118,
    lng: 126.3922,
    kakaoUrl: "https://open.kakao.com/o/some-link13",
    processes: ["봉제", "나염"],
  },
  {
    id: "14",
    name: "경북패션센터",
    ownerUserId: "factory14",
    region: "경북",
    items: ["티셔츠", "셔츠"],
    minOrder: 140,
    description: "경북 구미, 대량 생산 특화.",
    image: "",
    images: [],
    contact: "054-111-2121",
    lat: 36.1195,
    lng: 128.3446,
    kakaoUrl: "https://open.kakao.com/o/some-link14",
    processes: ["봉제", "나염"],
  },
  {
    id: "15",
    name: "경남의류공장",
    ownerUserId: "factory15",
    region: "경남",
    items: ["바지", "코트"],
    minOrder: 120,
    description: "경남 창원, 다양한 품목 생산.",
    image: "",
    images: [],
    contact: "055-313-4141",
    lat: 35.2285,
    lng: 128.6811,
    kakaoUrl: "https://open.kakao.com/o/some-link15",
    processes: ["봉제", "나염"],
  },
  {
    id: "16",
    name: "제주패션공방",
    ownerUserId: "factory16",
    region: "제주",
    items: ["원피스", "셔츠"],
    minOrder: 70,
    description: "제주도에서 만나는 감각적인 디자인 봉제공장.",
    image: "",
    images: [],
    contact: "064-707-8080",
    lat: 33.4996,
    lng: 126.5312,
    kakaoUrl: "https://open.kakao.com/o/some-link16",
    processes: ["봉제", "나염"],
  },
  {
    id: "17",
    name: "서울의류마을",
    ownerUserId: "factory17",
    region: "서울",
    items: ["티셔츠", "자켓"],
    minOrder: 100,
    description: "서울 동대문, 트렌디한 디자인 전문.",
    image: "",
    images: [],
    contact: "02-1717-1717",
    lat: 37.5700,
    lng: 127.0095,
    kakaoUrl: "https://open.kakao.com/o/some-link17",
    processes: ["봉제", "나염"],
  },
  {
    id: "18",
    name: "부산패션타운",
    ownerUserId: "factory18",
    region: "부산",
    items: ["셔츠", "바지"],
    minOrder: 120,
    description: "부산 해운대, 남성복 대량 생산.",
    image: "",
    images: [],
    contact: "051-1818-1818",
    lat: 35.1632,
    lng: 129.1636,
    kakaoUrl: "https://open.kakao.com/o/some-link18",
    processes: ["봉제", "나염"],
  },
  {
    id: "19",
    name: "대구의상타운",
    ownerUserId: "factory19",
    region: "대구",
    items: ["원피스", "스커트"],
    minOrder: 80,
    description: "대구 동성로, 여성복 소량 주문 환영.",
    image: "",
    images: [],
    contact: "053-1919-1919",
    lat: 35.8686,
    lng: 128.5945,
    kakaoUrl: "https://open.kakao.com/o/some-link19",
    processes: ["봉제", "나염"],
  },
  {
    id: "20",
    name: "인천패션스튜디오",
    ownerUserId: "factory20",
    region: "인천",
    items: ["아우터", "점퍼"],
    minOrder: 150,
    description: "인천 송도, 고급 아우터 전문.",
    image: "",
    images: [],
    contact: "032-2020-2020",
    lat: 37.3891,
    lng: 126.6445,
    kakaoUrl: "https://open.kakao.com/o/some-link20",
    processes: ["봉제", "나염"],
  },
  {
    id: "21",
    name: "광주의류마켓",
    ownerUserId: "factory21",
    region: "광주",
    items: ["티셔츠", "셔츠"],
    minOrder: 110,
    description: "광주 남구, 다양한 품목 생산.",
    image: "",
    images: [],
    contact: "062-2121-2121",
    lat: 35.1330,
    lng: 126.9020,
    kakaoUrl: "https://open.kakao.com/o/some-link21",
    processes: ["봉제", "나염"],
  },
  {
    id: "22",
    name: "대전패션스퀘어",
    ownerUserId: "factory22",
    region: "대전",
    items: ["바지", "코트"],
    minOrder: 130,
    description: "대전 유성구, 남성복/여성복 모두 가능.",
    image: "",
    images: [],
    contact: "042-2222-2222",
    lat: 36.3622,
    lng: 127.3568,
    kakaoUrl: "https://open.kakao.com/o/some-link22",
    processes: ["봉제", "나염"],
  },
  {
    id: "23",
    name: "울산의상마을",
    ownerUserId: "factory23",
    region: "울산",
    items: ["자켓", "셔츠"],
    minOrder: 90,
    description: "울산 북구, 소량 생산 특화.",
    image: "",
    images: [],
    contact: "052-2323-2323",
    lat: 35.5833,
    lng: 129.3600,
    kakaoUrl: "https://open.kakao.com/o/some-link23",
    processes: ["봉제", "나염"],
  },
  {
    id: "24",
    name: "경기의류타운",
    ownerUserId: "factory24",
    region: "경기",
    items: ["티셔츠", "스커트"],
    minOrder: 200,
    description: "경기 수원, 대량 생산 가능.",
    image: "",
    images: [],
    contact: "031-2424-2424",
    lat: 37.2636,
    lng: 127.0286,
    kakaoUrl: "https://open.kakao.com/o/some-link24",
    processes: ["봉제", "나염"],
  },
  {
    id: "25",
    name: "강원의류센터",
    ownerUserId: "factory25",
    region: "강원",
    items: ["원피스", "블라우스"],
    minOrder: 60,
    description: "강원 원주, 꼼꼼한 품질 관리.",
    image: "",
    images: [],
    contact: "033-2525-2525",
    lat: 37.3422,
    lng: 127.9207,
    kakaoUrl: "https://open.kakao.com/o/some-link25",
    processes: ["봉제", "나염"],
  },
  {
    id: "26",
    name: "충북의상마을",
    ownerUserId: "factory26",
    region: "충북",
    items: ["아우터", "점퍼"],
    minOrder: 110,
    description: "충북 충주, 소량/대량 모두 가능.",
    image: "",
    images: [],
    contact: "043-2626-2626",
    lat: 36.9910,
    lng: 127.9258,
    kakaoUrl: "https://open.kakao.com/o/some-link26",
    processes: ["봉제", "나염"],
  },
  // ... (27~70번까지 위 패턴을 참고하여 다양한 지역, 품목, 이미지, 설명, 위도/경도, 연락처, ownerUserId로 실제 데이터 추가)
  // ...
];

// export용 factories: image, images 필드만 순환 할당
export const factories: Factory[] = factoriesRaw.map((f, idx) => ({
  ...f,
  image: sampleImages[idx % sampleImages.length],
  images: getRandomImages(idx),
}));

// Supabase에서 봉제공장 데이터를 가져오는 함수
export async function fetchFactoriesFromDB(): Promise<Factory[]> {
  try {
    const { data, error } = await supabase.from("donggori").select("*");
    
    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("Supabase에서 데이터를 찾을 수 없습니다.");
      return [];
    }

    // 전체 공장 목록 디버깅
    const allFactoryNames = data.map((item: Record<string, unknown>) => 
      String(item.company_name || item.name || "공장명 없음")
    );
    console.log("전체 공장 목록:", allFactoryNames);
    console.log("조아스타일 포함 여부:", allFactoryNames.some(name => name.includes("조아") || name.includes("스타일")));

    // 희망사 제외하고 Supabase 데이터를 Factory 인터페이스에 맞게 매핑
    const filteredData = data.filter((item: Record<string, unknown>) => {
      const companyName = String(item.company_name || item.name || "공장명 없음");
      
      // 조아스타일 디버깅
      if (companyName.includes("조아") || companyName.includes("스타일")) {
        console.log("조아스타일 관련 공장 발견:", companyName, item);
      }
      
      return companyName !== "희망사";
    });

    // 조아스타일이 데이터베이스에 없는 경우 임시 테스트 데이터 추가
    const hasJoastyle = filteredData.some(item => 
      String(item.company_name || item.name || "").includes("조아") || 
      String(item.company_name || item.name || "").includes("스타일")
    );
    
    if (!hasJoastyle) {
      console.log("조아스타일이 데이터베이스에 없습니다. 임시 테스트 데이터를 추가합니다.");
      filteredData.push({
        id: "test-joastyle",
        company_name: "조아스타일",
        owner_user_id: "test",
        admin_district: "이문동",
        moq: 50,
        intro_text: "조아스타일 테스트 공장입니다.",
        phone_number: "02-1234-5678",
        lat: 37.5679,
        lng: 126.9789,
        kakao_url: "",
        business_type: "봉제",
        address: "서울특별시 동대문구 이문동"
      });
    }
    
    const mappedFactories: Factory[] = filteredData.map((item: Record<string, unknown>) => {
      const companyName = String(item.company_name || item.name || "공장명 없음");
      
      // 디버깅을 위한 로그 추가
      console.log("Mapping factory:", companyName);
      console.log("Main image:", getFactoryMainImage(companyName));
      console.log("All images:", getFactoryImages(companyName));
      
      return {
        id: String(item.id || Math.random()),
        name: companyName,
        ownerUserId: String(item.owner_user_id || item.ownerUserId || "unknown"),
        region: String(item.admin_district || item.region || "지역 없음"),
        items: [], // items는 별도 필드들로 구성
        minOrder: Number(item.moq) || 0,
        description: String(item.intro_text || item.intro || item.description || "설명 없음"),
        image: getFactoryMainImage(companyName), // 업장 이름으로 이미지 매칭
        images: getFactoryImages(companyName), // 업장 이름으로 모든 이미지 가져오기
        contact: String(item.phone_number || item.contact || "연락처 없음"),
        lat: Number(item.lat) || 37.5665,
        lng: Number(item.lng) || 126.9780,
        kakaoUrl: String(item.kakao_url || item.kakaoUrl || ""),
        processes: item.processes ? (Array.isArray(item.processes) ? item.processes as string[] : [String(item.processes)]) : [],
        // DB 연동용 확장 필드들
        business_type: item.business_type as string | undefined,
        equipment: item.equipment as string | undefined,
        sewing_machines: item.sewing_machines as string | undefined,
        pattern_machines: item.pattern_machines as string | undefined,
        special_machines: item.special_machines as string | undefined,
        top_items_upper: item.top_items_upper as string | undefined,
        top_items_lower: item.top_items_lower as string | undefined,
        top_items_outer: item.top_items_outer as string | undefined,
        top_items_dress_skirt: item.top_items_dress_skirt as string | undefined,
        top_items_bag: item.top_items_bag as string | undefined,
        top_items_fashion_accessory: item.top_items_fashion_accessory as string | undefined,
        top_items_underwear: item.top_items_underwear as string | undefined,
        top_items_sports_leisure: item.top_items_sports_leisure as string | undefined,
        top_items_pet: item.top_items_pet as string | undefined,
        moq: Number(item.moq) || undefined,
        monthly_capacity: Number(item.monthly_capacity) || undefined,
        admin_district: item.admin_district as string | undefined,
        intro: (item.intro_text || item.intro) as string | undefined,
        phone_number: item.phone_number as string | undefined,
        factory_type: item.factory_type as string | undefined,
        main_fabrics: item.main_fabrics as string | undefined,
        distribution: item.distribution as string | undefined,
        delivery: item.delivery as string | undefined,
        company_name: item.company_name as string | undefined,
        contact_name: item.contact_name as string | undefined,
        email: item.email as string | undefined,
        address: item.address as string | undefined,
        established_year: Number(item.established_year) || undefined,
        brands_supplied: item.brands_supplied as string | undefined,
      };
    });

    console.log(`Supabase에서 ${mappedFactories.length}개의 공장 데이터를 가져왔습니다.`);
    
    // 이미지가 있는 업장들을 맨 상단으로 정렬
    const sortedFactories = mappedFactories.sort((a, b) => {
      const aHasImages = a.images && a.images.length > 0 && a.images[0] !== '/logo_donggori.png';
      const bHasImages = b.images && b.images.length > 0 && b.images[0] !== '/logo_donggori.png';
      
      if (aHasImages && !bHasImages) return -1;
      if (!aHasImages && bHasImages) return 1;
      return 0;
    });
    
    return sortedFactories;
  } catch (error) {
    console.error("Supabase 데이터 가져오기 중 오류 발생:", error);
    return [];
  }
} 