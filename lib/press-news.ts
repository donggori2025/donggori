export type PressTag = "동고리" | "동고리·패딧";

export type PressArticle = {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  summary: string;
  tag: PressTag;
  /** 원문 기사 대표 이미지 (로컬 캐시) */
  image: string;
};

export const PRESS_ARTICLES: PressArticle[] = [
  {
    id: "shinailbo-20260709",
    title: "동대문구 봉제 연결 플랫폼 ‘동고리’ 등록업체 327곳으로 확대",
    source: "신아일보",
    date: "2026-07-09",
    url: "https://www.shinailbo.co.kr/news/articleView.html?idxno=5039238",
    summary:
      "동대문구가 운영하는 동고리 등록 봉제업체가 327곳으로 늘었다. AI 매칭으로 제작 조건에 맞는 공장을 찾고, 검색부터 의뢰·상담까지 온라인으로 진행할 수 있다.",
    tag: "동고리",
    image: "/images/news/shinailbo-20260709.jpg",
  },
  {
    id: "hgtimes-20260709",
    title: "동대문구, 디자이너-봉제공장 연결 플랫폼 등록 업체 327곳 돌파",
    source: "한강타임즈",
    date: "2026-07-09",
    url: "https://www.hg-times.com/news/articleView.html?idxno=303473",
    summary:
      "2026년 7월 8일 기준 등록 업체가 327곳으로 늘었다. 공장 위치·원단·품목·보유 기술을 공개하고, 직접 검색 또는 AI 매칭으로 생산 파트너를 찾는다.",
    tag: "동고리",
    image: "/images/news/hgtimes-20260709.jpg",
  },
  {
    id: "sidaeilbo-20260709",
    title: "동대문구 ‘동고리’, 등록 봉제업체 327곳…디자이너와 공장 연결 확대",
    source: "시대일보",
    date: "2026-07-09",
    url: "https://www.sidaeilbo.co.kr/1246666",
    summary:
      "옷을 만들고 싶지만 공장을 찾기 어려운 디자이너와 일감이 필요한 봉제업체를 잇는 생산 연결 플랫폼으로, 누리집(www.donggori.com)에서 상담을 진행할 수 있다.",
    tag: "동고리",
    image: "/images/news/sidaeilbo-20260709.jpg",
  },
  {
    id: "hkbs-20260709",
    title: "디자이너-봉제공장 상생 파트너 ‘동고리’",
    source: "환경일보",
    date: "2026-07-09",
    url: "https://www.hkbs.co.kr/news/articleView.html?idxno=827729",
    summary:
      "소개·발품에 의존하던 제작 연결을 플랫폼 안에서 처리해 양측 편의를 높인다. 등록 확대와 이용 편의 개선으로 지역 봉제산업 디지털 전환을 지원한다.",
    tag: "동고리",
    image: "/images/news/hkbs-20260709.png",
  },
  {
    id: "pinpoint-20260709",
    title: "동대문구, 봉제 플랫폼 '동고리' 등록업체 327곳",
    source: "핀포인트뉴스",
    date: "2026-07-09",
    url: "https://www.pinpointnews.co.kr/news/articleView.html?idxno=467049",
    summary:
      "지역 봉제산업의 디지털 전환과 일감 연계 확대 차원에서 동고리를 운영한다. 최동민 구청장은 디자이너의 생산 파트너 탐색과 업체의 일감 연결을 지원하겠다고 밝혔다.",
    tag: "동고리",
    image: "/images/news/pinpoint-20260709.jpg",
  },
  {
    id: "newsro-20260709",
    title: "동대문구 ‘동고리’, 등록 봉제업체 327곳…디자이너와 공장 연결 확대",
    source: "뉴스로",
    date: "2026-07-09",
    url: "https://www.newsro.kr/articles/1840450",
    summary:
      "업체가 기술과 생산 역량을 온라인에 알리고, 조건에 맞는 제작 의뢰와 연결될 가능성을 높이는 공공 기반 매칭 서비스로 소개됐다.",
    tag: "동고리",
    image: "/images/news/newsro-20260709.jpg",
  },
  {
    id: "startupn-20260605",
    title: "패딧, 패션 제조 DX 플랫폼 출시…작업지시서부터 생산까지 한 번에",
    source: "스타트업엔",
    date: "2026-06-05",
    url: "https://www.startupn.kr/news/articleView.html?idxno=58199",
    summary:
      "패딧이 작업지시서 중심 DX 플랫폼을 출시하며, 동대문 봉제 협회·경희대와 함께 동고리를 운영 중이라고 밝혔다. 공공 제조 네트워크와 생산 매칭을 연계한다.",
    tag: "동고리·패딧",
    image: "/images/news/startupn-20260605.png",
  },
  {
    id: "platum-20260605",
    title: "패딧, 작업지시서 기반 패션 제조 DX 플랫폼 출시",
    source: "플래텀",
    date: "2026-06-05",
    url: "https://platum.kr/archives/288311",
    summary:
      "패딧이 드라이브·도식화·원단·2D·3D·생산을 잇는 플랫폼을 출시했다. 동대문구의류봉제산업연합회 등과 협력해 동고리 플랫폼도 함께 운영한다.",
    tag: "동고리·패딧",
    image: "/images/news/platum-20260605.png",
  },
  {
    id: "besuccess-20260605",
    title: "패딧, 작업지시서 중심 패션 제조 DX 플랫폼 출시…AI 도식화 및 실시간 협업 지원",
    source: "beSUCCESS",
    date: "2026-06-05",
    url: "https://besuccess.com/?p=183566",
    summary:
      "경희대·동대문 봉제 기업과 검증한 뒤, 동고리를 통해 약 1,800개 봉제업장과 일감을 매칭하는 구조로 운영한다고 보도됐다.",
    tag: "동고리·패딧",
    image: "/images/news/besuccess-20260605.png",
  },
  {
    id: "kspost-20260607",
    title: "패션테크 스타트업 패딧, '패션 제조 DX 플랫폼' 정식 출시",
    source: "KS포스트",
    date: "2026-06-07",
    url: "https://www.kspost.biz/ko-kr/articles/2595",
    summary:
      "패딧이 기획부터 생산까지 작업지시서로 통합하는 DX 플랫폼을 출시했다. 동고리를 통해 공공 기반 제조 네트워크와 현장 일감 매칭을 지원한다고 전했다.",
    tag: "동고리·패딧",
    image: "/images/news/kspost-20260607.png",
  },
  {
    id: "herald-20251229",
    title: "패션테크 스타트업 패딧, 의류 제작 ‘디지털 표준 언어’ 서비스 정식 출시",
    source: "헤럴드경제",
    date: "2025-12-29",
    url: "https://biz.heraldcorp.com/article/10645256",
    summary:
      "패딧의 디지털 표준 언어 서비스를 동대문구 일감 연계 플랫폼 동고리와 경희대 산학 프로그램에 적용해 현장 생산성과 소통 구조 변화를 검증하고 있다고 보도했다.",
    tag: "동고리·패딧",
    image: "/images/news/herald-20251229.png",
  },
  {
    id: "besuccess-20251229",
    title: "패션테크 스타트업 ‘패딧’, 의류 제작 ‘디지털 표준 언어’ 서비스 정식 출시",
    source: "beSUCCESS",
    date: "2025-12-29",
    url: "https://besuccess.com/?p=178478",
    summary:
      "동고리와 경희대 산학협력을 통해 실제 제작 현장에 도입됐으며, 동대문구청 협업으로 봉제 네트워크 MOU와 디지털 제작 표준 확산을 추진한다고 전했다.",
    tag: "동고리·패딧",
    image: "/images/news/besuccess-20251229.png",
  },
  {
    id: "herald-20251121",
    title: "동대문구, 패션봉제산업 활성화 민·관·학 재협약",
    source: "헤럴드경제",
    date: "2025-11-21",
    url: "https://biz.heraldcorp.com/article/10621358",
    summary:
      "동대문구·3개 봉제협회·경희대 RISE사업단이 재협약했다. 2024년 9월부터 동고리를 구축한 성과를 바탕으로 AI 스마트 봉제 매칭을 본격 추진한다.",
    tag: "동고리",
    image: "/images/news/herald-20251121.jpg",
  },
  {
    id: "munhwa-20251123",
    title: "동대문구, 패션봉제산업 활성화 위해 민·관·학 재협약 체결",
    source: "문화일보",
    date: "2025-11-23",
    url: "https://www.munhwa.com/article/11548831",
    summary:
      "동고리 플랫폼으로 청년 디자이너와 봉제업체를 AI 매칭하는 스마트 봉제를 확대하고, 산·학 공동 프로젝트 참여 기회를 넓힌다고 보도했다.",
    tag: "동고리",
    image: "/images/news/munhwa-20251123.jpg",
  },
  {
    id: "newsro-20251121",
    title: "동대문구, 패션봉제산업 활성화 위해 민·관·학 재협약",
    source: "뉴스로",
    date: "2025-11-21",
    url: "https://www.newsro.kr/articles/1432330",
    summary:
      "일감연계플랫폼 동고리를 활용해 청년 디자이너와 관내 봉제업체를 AI로 매칭하는 스마트 봉제 시스템을 추진한다고 전했다.",
    tag: "동고리",
    image: "/images/news/newsro-20251121.jpg",
  },
  {
    id: "heraldk-20251121",
    title: "동대문구, 패션봉제산업 활성화 민·관·학 재협약",
    source: "헤럴드경제(heraldk)",
    date: "2025-11-21",
    url: "https://heraldk.com/2025/11/21/%eb%8f%99%eb%8c%80%eb%ac%b8%ea%b5%ac-%ed%8c%a8%ec%85%98%eb%b4%89%ec%a0%9c%ec%82%b0%ec%97%85-%ed%99%9c%ec%84%b1%ed%99%94-%eb%af%bc%c2%b7%ea%b4%80%c2%b7%ed%95%99-%ec%9e%ac%ed%98%91%ec%95%bd/",
    summary:
      "첫 협약 기간(2024.9.10.~2025.2.28.) 동고리 구축과 경희크리에이터 산학 프로젝트를 바탕으로 두 번째 MOU를 체결한 소식을 전했다.",
    tag: "동고리",
    image: "/images/news/heraldk-20251121.jpg",
  },
];

export function getPressArticles() {
  return [...PRESS_ARTICLES].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
