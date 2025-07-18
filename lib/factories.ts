import { supabase } from "./supabaseClient";

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
  [key: string]: string | number | string[] | undefined;
}

// factories: 봉제공장 샘플 데이터 70개
// 실제 서비스에서는 DB에서 관리하지만, 샘플은 하드코딩 배열로 관리합니다.
export const factories: Factory[] = [
  // 1~3: 기존 샘플
  {
    id: "1",
    name: "서울패션공장",
    ownerUserId: "factory1",
    region: "서울",
    items: ["티셔츠", "셔츠", "원피스"],
    minOrder: 100,
    description: "서울 도심에 위치한 20년 경력의 봉제공장입니다.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80"
    ],
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
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    ],
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
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80"
    ],
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
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    contact: "043-2626-2626",
    lat: 36.9910,
    lng: 127.9258,
    kakaoUrl: "https://open.kakao.com/o/some-link26",
    processes: ["봉제", "나염"],
  },
  // ... (27~70번까지 위 패턴을 참고하여 다양한 지역, 품목, 이미지, 설명, 위도/경도, 연락처, ownerUserId로 실제 데이터 추가)
  // ...
];

// Supabase에서 봉제공장 데이터를 가져오는 함수
export async function fetchFactoriesFromDB(): Promise<Factory[]> {
  const { data, error } = await supabase.from("donggori").select("*");
  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  return (data as Factory[]) || [];
} 