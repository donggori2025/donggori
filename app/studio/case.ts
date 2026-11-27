export const product = "M-65 피쉬테일 숏 파카";
export const asset = (file: string) => `/images/demo/${file}`;

export const sheets = [
  { title: "스펙 보드", file: "spec-board.png" },
  { title: "도식화", file: "drawing.png" },
  { title: "봉제 지시", file: "sewing.png" },
  { title: "라벨 사양", file: "labels.png" },
] as const;

// Detail crops use pixel coordinates on the original artwork.
export const details = [
  {
    page: 2, mark: "08", section: "봉제 순서", title: "피쉬테일 밑단 터널",
    instruction: "밑단을 겹쳐 박고, 조임끈이 나올 자리에 아일렛을 냅니다.",
    specs: [["채널 너비", "2.2 cm"], ["양끝 바텍", "2회"]],
    crop: { file: "drawing.png", width: 1106, height: 660, viewBox: "600 432 246 120", alt: "파카 뒷면의 피쉬테일 밑단과 조임끈 도식화" },
  },
  {
    page: 3, mark: "01", section: "라벨 사양", title: "메인 라벨",
    instruction: "뒷목 안쪽 중앙에 놓고 양끝을 접어 봉제합니다.",
    specs: [["완성 치수", "75 × 20 mm"]],
    crop: { file: "labels.png", width: 879, height: 661, viewBox: "599 144 220 87", alt: "양쪽 접는 선과 치수가 표시된 메인 라벨 도면" },
  },
] as const;

// Snapshot of public Donggori profiles for the 47-piece presentation case.
export const partners = [
  {
    id: "64",
    name: "좋은사람",
    district: "장안동",
    stars: 3,
    item: "사파리·헌팅 재킷",
    highlight: "샘플부터 생산까지",
    question: "이 조건으로 샘플을 먼저 만든 뒤 본생산까지 맡길 수 있을까요?",
    reason: "이번 파카와 같은 사파리형 재킷을 샘플부터 생산까지 다룹니다.",
    about: "샘플에서 생산까지 진행하는 장안동 봉제공장입니다.",
    photos: ["joeunsaram-3.webp", "joeunsaram-1.webp", "joeunsaram-2.webp"].map(asset),
  },
  {
    id: "54",
    name: "옷 만드는 사람들",
    district: "신설동",
    stars: 3,
    item: "사파리·헌팅 재킷",
    highlight: "직기 원단",
    question: "이번 파카에 어울리는 직기 원단을 추천해 주실 수 있을까요?",
    reason: "이번 파카에 맞는 사파리형 재킷과 직기 원단을 다룹니다.",
    about: "남성복과 여성복을 두루 제작하는 신설동 직기 봉제공장입니다.",
    photos: ["makers-1.webp", "makers-2.webp"].map(asset),
  },
  {
    id: "74",
    name: "토탈패션",
    district: "용두동",
    stars: 2,
    item: "점퍼",
    highlight: "직기 점퍼",
    question: "직기 점퍼처럼 이번 파카도 제작할 수 있을까요?",
    reason: "이번 파카와 같은 아우터 계열인 직기 점퍼를 제작합니다.",
    about: "직기 원단으로 점퍼를 제작하는 용두동 봉제공장입니다.",
    photos: [],
  },
];
export type Partner = (typeof partners)[number] & { profile?: { label: string; value: string }[] };
