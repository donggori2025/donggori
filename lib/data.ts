import {
  type Activity,
  type Collection,
  type Comment,
  type LibraryAsset,
  type Product,
  type ProductCollaborator,
  type Team,
  type TrashedItem,
  type User,
  type Version,
  type Workspace,
} from "./types";

export const CURRENT_USER_ID = "kim-md";
export const PERSONAL_WORKSPACE_ID = "personal";

/** Chrome identity for the drive sidebar. Separate from demo collab users (김MD etc.). */
export const DISPLAY_ACCOUNT = {
  name: "김한재",
  email: "jay@faddit.co.kr",
};

export const TEAM_ATELIER_ID = "team-atelier";
export const TEAM_FADDIT_ID = "team-faddit";

export const teams: Team[] = [
  {
    id: TEAM_ATELIER_ID,
    name: "Atelier North",
    initial: "A",
    color: "#c8e6dc",
    memberIds: ["kim-md", "lee-minji", "park-prod", "choi-ceo"],
  },
  {
    id: TEAM_FADDIT_ID,
    name: "TEAM FADDIT",
    initial: "F",
    color: "#d7e6f5",
    memberIds: ["kim-md", "lee-minji", "park-prod", "choi-ceo", "han-factory"],
    locked: true,
  },
];

export const workspaces: Workspace[] = [
  {
    id: PERSONAL_WORKSPACE_ID,
    teamId: null,
    kind: "personal",
    name: "27S/S 김한재 디자인",
    initial: "2",
    color: "#e7e4dd",
    memberIds: ["kim-md"],
    sizeLabel: "4.2MB",
  },
  {
    id: "personal-memo",
    teamId: null,
    kind: "personal",
    name: "ㅇ",
    initial: "ㅇ",
    color: "#eeeae3",
    memberIds: ["kim-md"],
    sizeLabel: "0.1MB",
  },
  {
    id: "atelier-north",
    teamId: TEAM_ATELIER_ID,
    kind: "team",
    name: "26SS Collection",
    initial: "2",
    color: "#c8e6dc",
    memberIds: ["kim-md", "lee-minji", "park-prod", "choi-ceo"],
    sizeLabel: "18.4MB",
  },
  {
    id: "faddit-packs",
    teamId: TEAM_FADDIT_ID,
    kind: "team",
    name: "제품 템플릿",
    initial: "작",
    color: "#b6e3f4",
    memberIds: ["kim-md", "lee-minji", "park-prod", "choi-ceo", "han-factory"],
    sizeLabel: "13.7MB",
  },
  {
    id: "faddit-pr",
    teamId: TEAM_FADDIT_ID,
    kind: "team",
    name: "FDD_Templates",
    initial: "F",
    color: "#c8e6dc",
    memberIds: ["kim-md", "lee-minji", "park-prod", "choi-ceo", "han-factory"],
    sizeLabel: "23.7MB",
    locked: true,
  },
];

export const users: User[] = [
  { id: "kim-md", name: "김MD", title: "MD / Product Manager", role: "reviewer", initials: "김", color: "#d7e6f5", email: "kim@faddit.co.kr" },
  { id: "lee-minji", name: "이민지", title: "Fashion Designer", role: "designer", initials: "민", color: "#e4dcf3", email: "minji@faddit.co.kr" },
  { id: "park-prod", name: "박생산", title: "Technical Designer", role: "production", initials: "박", color: "#d3ede3", email: "park@faddit.co.kr" },
  { id: "choi-ceo", name: "최대표", title: "CEO", role: "admin", initials: "최", color: "#f3ebc7", email: "choi@faddit.co.kr" },
  { id: "han-factory", name: "한공장", title: "Factory / Vendor", role: "guest", initials: "한", color: "#f6dfd0", email: "han@vendor.co.kr" },
];

const PASTEL_AVATARS = ["#d7e6f5", "#e4dcf3", "#d3ede3", "#f3ebc7", "#f6dfd0", "#f3e0c8"];

export function firstSyllable(text: string) {
  const ch = Array.from(text.trim())[0];
  if (!ch) return "?";
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}

export function userFromEmail(email: string): User {
  return userFromToken(email);
}

export function userFromToken(token: string): User {
  const t = token.trim();
  const isEmail = t.includes("@");
  const normalized = isEmail ? t.toLowerCase() : t;
  const prefix = isEmail ? normalized.split("@")[0] || "guest" : t;
  let h = 0;
  for (let i = 0; i < normalized.length; i++) h = (h * 31 + normalized.charCodeAt(i)) | 0;
  return {
    id: `pending-${normalized.replace(/[^a-z0-9가-힣]+/gi, "-") || "user"}`,
    name: prefix,
    title: "초대됨",
    role: "guest",
    initials: firstSyllable(prefix),
    color: PASTEL_AVATARS[Math.abs(h) % PASTEL_AVATARS.length],
    email: isEmail ? normalized : undefined,
  };
}

export function defaultCollaborators(p: {
  ownerId: string;
  designerId: string;
  productionManagerId: string;
}): ProductCollaborator[] {
  const list: ProductCollaborator[] = [{ userId: p.ownerId, access: "owner" }];
  if (p.designerId !== p.ownerId) list.push({ userId: p.designerId, access: "assignee" });
  if (p.productionManagerId !== p.ownerId && p.productionManagerId !== p.designerId) {
    list.push({ userId: p.productionManagerId, access: "edit" });
  }
  return list;
}

export function collaboratorsOf(product: Product): ProductCollaborator[] {
  return product.collaborators?.length ? product.collaborators : defaultCollaborators(product);
}

export function productMemberIds(product: Product) {
  return Array.from(
    new Set([
      product.ownerId,
      product.designerId,
      product.productionManagerId,
      ...collaboratorsOf(product).map((c) => c.userId),
      ...(product.collaboratorIds ?? []),
    ]),
  );
}

export const collections: Collection[] = [
  {
    id: "26ss",
    name: "26SS",
    season: "Spring / Summer",
    year: "2026",
    description: "오버사이즈 실루엣과 그래픽을 중심으로 한 메인 시즌 라인",
  },
  {
    id: "25fw",
    name: "25FW",
    season: "Fall / Winter",
    year: "2025",
    description: "헤비 코튼과 울 혼방 중심의 아카이브 시즌",
  },
];

const hoodieSpecs = {
  description: "드롭숄더 오버사이즈 후디. 캥거루 포켓, 이중 후드, 1x1 립 마감.",
  identity: {
    brand: "26SS Collection",
    item: "Hoodie",
    gender: "Unisex",
    season: "2026 SS",
    sampleDue: "2026-08-20",
    productionDue: "2026-09-12",
    manager: "김MD",
  },
  materials: [
    {
      id: "fab-1",
      name: "Cotton Fleece",
      composition: "Cotton 80 / Poly 20",
      weight: "420g",
      supplier: "Daehan Textile",
      color: "#E8E4DC",
      position: "추가 부위",
      consumption: "1.0 yd",
      colorName: "Ecru",
      memo: "",
      status: "",
    },
  ],
  trims: [
    {
      id: "tr-1",
      name: "Drawstring",
      type: "String",
      spec: "Cotton 6mm / 130cm",
      color: "Ecru",
      position: "후드",
      qty: "1 pcs",
      attach: "Knot finish",
      memo: "",
      status: "",
    },
    {
      id: "tr-2",
      name: "Metal Eyelet",
      type: "Hardware",
      spec: "Ø8mm Antique Nickel",
      color: "Nickel",
      position: "후드 아일렛",
      qty: "2 pcs",
      attach: "Press",
      memo: "",
      status: "",
    },
    {
      id: "tr-3",
      name: "Main Label",
      type: "Label",
      spec: "40 × 25mm Woven Damask",
      color: "#EDE6D9",
      position: "Back neck",
      qty: "1 pcs",
      attach: "Single needle",
      memo: "",
      status: "",
    },
  ],
  labels: [
    { id: "lb-1", kind: "main" as const, name: "Main Label", material: "Woven Damask", size: "40 × 25mm", position: "Back neck" },
    { id: "lb-2", kind: "care" as const, name: "Care Label", material: "Satin print", size: "20 × 70mm", position: "Left side seam" },
  ],
  colorways: [
    {
      id: "cw-1",
      name: "Ecru",
      main: "Ecru",
      sub: "Natural",
      code: "SS26-HD-01",
      hex: "#EDE6D9",
      qtyBySize: { S: 80, M: 140, L: 160, XL: 80 },
      memo: "",
    },
    {
      id: "cw-2",
      name: "Charcoal",
      main: "Charcoal",
      sub: "Black",
      code: "SS26-HD-02",
      hex: "#3A3A38",
      qtyBySize: { S: 0, M: 0, L: 0, XL: 0 },
      memo: "",
    },
  ],
  sizeRange: ["S", "M", "L", "XL"],
  measurements: [
    { pom: "A", label: "Length", s: "64", m: "66", l: "68", xl: "70", grade: 2, tolerance: "±1" },
    { pom: "B", label: "Chest", s: "55", m: "57", l: "59", xl: "61", grade: 2, tolerance: "±1" },
    { pom: "C", label: "Sleeve Width", s: "24", m: "25", l: "26", xl: "27", grade: 1, tolerance: "±0.5" },
    { pom: "D", label: "Shoulder", s: "48", m: "50", l: "52", xl: "54", grade: 2, tolerance: "±1" },
  ],
  artwork: [
    { title: "Back Graphic", technique: "Screen print", size: "280 × 320mm", position: "Center back", color: "Black" },
  ],
  quantity: [
    { size: "S", qty: 80 },
    { size: "M", qty: 140 },
    { size: "L", qty: 160 },
    { size: "XL", qty: 80 },
  ],
  packaging: [
    { title: "Folding", note: "Retail fold, tissue insert" },
    { title: "Polybag", note: "Clear 50μ, size sticker" },
  ],
  notes: [{ title: "Factory Note", body: "후드 끈 끝단 열처리. 포켓 입구 보강 스티치 필수." }],
  misc: "<p><strong>접기</strong> — 리테일 접기, 티슈 삽입</p><p><strong>폴리백</strong> — 투명 50μ, 사이즈 스티커</p><p><strong>행택</strong> — 메인 라벨과 동일한 크래프트, 케어 리플렛 동봉</p>",
  miscBoard: [
    {
      id: "misc-p1",
      title: "1",
      orient: "landscape" as const,
      objects: [
        { id: "misc-t1", type: "text" as const, x: 56, y: 48, w: 680, h: 44, text: "포장 · 출고", fontSize: 28 },
        {
          id: "misc-t2",
          type: "text" as const,
          x: 56,
          y: 112,
          w: 440,
          h: 280,
          text: "접기\n리테일 접기, 티슈 삽입\n\n폴리백\n투명 50μ, 사이즈 스티커\n\n행택\n메인 라벨과 동일한 크래프트\n케어 리플렛 동봉",
          fontSize: 16,
        },
        { id: "misc-n1", type: "note" as const, x: 520, y: 120, w: 200, h: 140, text: "출고 전 폴리백 실링과 사이즈 스티커를 확인하세요." },
        { id: "misc-a1", type: "arrow" as const, x: 470, y: 180, x2: 520, y2: 180 },
      ],
    },
  ],
};

export function emptySpecs(description: string) {
  return {
    description,
    materials: [] as Product["specs"]["materials"],
    trims: [] as Product["specs"]["trims"],
    labels: [] as Product["specs"]["labels"],
    colorways: [] as Product["specs"]["colorways"],
    sizeRange: ["S", "M", "L", "XL"],
    measurements: [] as Product["specs"]["measurements"],
    artwork: [] as Product["specs"]["artwork"],
    quantity: [] as Product["specs"]["quantity"],
    packaging: [] as Product["specs"]["packaging"],
    notes: [] as Product["specs"]["notes"],
    misc: "",
  };
}

const seedProducts: Omit<Product, "workspaceId" | "collaborators" | "anyoneAccess" | "workspaceAccess">[] = [
  {
    id: "hoodie-01",
    name: "Oversized Hoodie #01",
    code: "26SS-HD-01",
    collectionId: "26ss",
    category: "hoodie",
    status: "design_review",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    factory: "한성봉제",
    dueDate: "2026-08-28",
    version: 4,
    updatedAt: "오늘 11:10",
    productionReady: 62,
    completed: ["Design", "Main Fabric", "Label", "Colorway", "Artwork"],
    missing: ["Size Spec", "Construction", "Quantity"],
    specs: hoodieSpecs,
    files: [
      {
        id: "file-main-label",
        name: "main-label.svg",
        mime: "image/svg+xml",
        size: 1200,
        src: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" fill="#f4f2ee"/><rect x="48" y="48" width="384" height="204" fill="#fff" stroke="#1a1916" stroke-width="2"/><text x="240" y="148" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#1a1916">MAIN LABEL</text><text x="240" y="186" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6f6b64">40 × 25mm · Woven Damask</text></svg>`,
        )}`,
        source: "specs",
        kind: "label",
        purpose: "메인 라벨 · 백넥",
        createdAt: "오늘 11:10",
      },
      {
        id: "file-chest-print",
        name: "chest-print.svg",
        mime: "image/svg+xml",
        size: 1400,
        src: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" fill="#f4f2ee"/><circle cx="240" cy="240" r="148" fill="#1a1916"/><text x="240" y="248" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#f4f2ee">CHEST PRINT</text></svg>`,
        )}`,
        source: "specs",
        kind: "print",
        purpose: "가슴 그래픽 나염",
        createdAt: "오늘 11:10",
      },
    ],
    nodes: [
      { id: "n-flat", type: "flat", title: "Hoodie Flat Drawing", x: 80, y: 40 },
      { id: "n-2d", type: "mockup2d", title: "2D Mockup", x: 560, y: 40, linkedTo: "n-flat" },
      { id: "n-3d", type: "mockup3d", title: "3D Mockup", x: 560, y: 320, linkedTo: "n-flat" },
      { id: "n-label", type: "label", title: "Main Label", x: 80, y: 420, linkedTo: "n-flat" },
    ],
  },
  {
    id: "hoodie-02",
    name: "Crop Hoodie #02",
    code: "26SS-HD-02",
    collectionId: "26ss",
    category: "hoodie",
    status: "designing",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-08-30",
    version: 2,
    updatedAt: "어제",
    productionReady: 28,
    completed: ["Design"],
    missing: ["Main Fabric", "Trim", "Size Spec", "Colorway"],
    specs: emptySpecs("크롭 기장 후디. 짧은 바디, 와이드 슬리브."),
    nodes: [{ id: "n-flat", type: "flat", title: "Crop Hoodie Flat", x: 80, y: 40 }],
  },
  {
    id: "tee-03",
    name: "Graphic Tee #03",
    code: "26SS-TS-03",
    collectionId: "26ss",
    category: "tee",
    status: "specs_in_progress",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    factory: "한성봉제",
    dueDate: "2026-09-02",
    version: 5,
    updatedAt: "오늘 10:30",
    productionReady: 71,
    completed: ["Design", "Main Fabric", "Artwork", "Colorway"],
    missing: ["Measurement", "Packaging"],
    specs: {
      ...emptySpecs("박스 실루엣 그래픽 티셔츠."),
      materials: [
        {
          id: "fab-t",
          name: "Cotton Jersey",
          composition: "Cotton 100",
          weight: "240g",
          supplier: "Seoul Knit",
          color: "#F5F0E8",
        },
      ],
      colorways: [
        { id: "cw-t", name: "Ivory", main: "Ivory", sub: "—", code: "26SS-TS-03A", hex: "#F4EFE4" },
      ],
    },
    nodes: [
      { id: "n-flat", type: "flat", title: "Tee Flat Drawing", x: 80, y: 40 },
      { id: "n-2d", type: "mockup2d", title: "2D Mockup", x: 560, y: 40, linkedTo: "n-flat" },
    ],
  },
  {
    id: "cargo-04",
    name: "Cargo Pants #04",
    code: "26SS-PT-04",
    collectionId: "26ss",
    category: "pants",
    status: "approved",
    ownerId: "choi-ceo",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    factory: "남양니트",
    dueDate: "2026-08-20",
    version: 6,
    updatedAt: "2일 전",
    productionReady: 100,
    completed: ["Design", "Main Fabric", "Trim", "Label", "Colorway", "Size Spec", "Construction", "Quantity"],
    missing: [],
    specs: {
      ...hoodieSpecs,
      description: "와이드 카고 팬츠. 사이드 포켓 2, 스트링 웨이스트.",
    },
    nodes: [
      { id: "n-flat", type: "flat", title: "Cargo Flat", x: 80, y: 40 },
      { id: "n-2d", type: "mockup2d", title: "2D Mockup", x: 560, y: 40, linkedTo: "n-flat" },
      { id: "n-3d", type: "mockup3d", title: "3D Mockup", x: 560, y: 320, linkedTo: "n-flat" },
    ],
  },
  {
    id: "jacket-01",
    name: "Stadium Jacket #01",
    code: "26SS-JK-01",
    collectionId: "26ss",
    category: "jacket",
    status: "specs_review",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-08-27",
    version: 3,
    updatedAt: "오늘 09:12",
    productionReady: 88,
    completed: ["Design", "Main Fabric", "Trim", "Label", "Colorway", "Artwork"],
    missing: ["Quantity"],
    specs: hoodieSpecs,
    nodes: [
      { id: "n-flat", type: "flat", title: "Jacket Flat", x: 80, y: 40 },
      { id: "n-label", type: "label", title: "Woven Label", x: 560, y: 40, linkedTo: "n-flat" },
      { id: "n-2d", type: "mockup2d", title: "2D Mockup", x: 80, y: 420, linkedTo: "n-flat" },
    ],
  },
  {
    id: "shirt-04",
    name: "Oxford Shirt #04",
    code: "26SS-SH-04",
    collectionId: "26ss",
    category: "shirt",
    status: "design_review",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-09-01",
    version: 2,
    updatedAt: "3시간 전",
    productionReady: 45,
    completed: ["Design", "Main Fabric"],
    missing: ["Size Spec", "Construction", "Trim", "Quantity"],
    specs: emptySpecs("오버핏 옥스포드 셔츠. 박스 플리츠, 캠프 칼라."),
    nodes: [{ id: "n-flat", type: "flat", title: "Shirt Flat", x: 80, y: 40 }],
  },
  {
    id: "pants-02",
    name: "Wide Pants #02",
    code: "26SS-PT-02",
    collectionId: "26ss",
    category: "pants",
    status: "specs_in_progress",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-08-29",
    version: 4,
    updatedAt: "오늘 12:20",
    productionReady: 64,
    completed: ["Design", "Main Fabric", "Colorway"],
    missing: ["Size Spec", "Construction"],
    specs: {
      ...emptySpecs("와이드 팬츠. 핀턱 2, 코튼 트윌."),
      materials: [
        {
          id: "fab-p",
          name: "Cotton Twill",
          composition: "Cotton 100",
          weight: "280g",
          supplier: "Busan Mill",
          color: "#C9C2B4",
        },
      ],
    },
    nodes: [{ id: "n-flat", type: "flat", title: "Pants Flat", x: 80, y: 40 }],
  },
  {
    id: "sweat-05",
    name: "Sweatshirt #05",
    code: "26SS-SW-05",
    collectionId: "26ss",
    category: "hoodie",
    status: "designing",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-09-05",
    version: 1,
    updatedAt: "5시간 전",
    productionReady: 18,
    completed: ["Design"],
    missing: ["Main Fabric", "Label", "Colorway", "Size Spec"],
    specs: emptySpecs("크루넥 스웻셔츠. 드롭숄더."),
    nodes: [{ id: "n-flat", type: "flat", title: "Sweat Flat", x: 80, y: 40 }],
  },
  {
    id: "vest-06",
    name: "Down Vest #06",
    code: "26SS-VT-06",
    collectionId: "26ss",
    category: "vest",
    status: "planning",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-09-10",
    version: 1,
    updatedAt: "1일 전",
    productionReady: 8,
    completed: [],
    missing: ["Design", "Main Fabric", "Trim", "Size Spec"],
    specs: emptySpecs("라이트 다운 베스트. 시즌 캡슐."),
    nodes: [{ id: "n-flat", type: "flat", title: "Vest Flat", x: 80, y: 40 }],
  },
  {
    id: "skirt-07",
    name: "Cargo Skirt #07",
    code: "26SS-SK-07",
    collectionId: "26ss",
    category: "skirt",
    status: "production_ready",
    ownerId: "choi-ceo",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    factory: "남양니트",
    dueDate: "2026-08-25",
    version: 5,
    updatedAt: "어제",
    productionReady: 96,
    completed: ["Design", "Main Fabric", "Trim", "Label", "Colorway", "Size Spec", "Construction"],
    missing: ["Packaging"],
    specs: hoodieSpecs,
    nodes: [
      { id: "n-flat", type: "flat", title: "Skirt Flat", x: 80, y: 40 },
      { id: "n-2d", type: "mockup2d", title: "2D Mockup", x: 560, y: 40, linkedTo: "n-flat" },
    ],
  },
  {
    id: "denim-08",
    name: "Denim Jacket #08",
    code: "26SS-DJ-08",
    collectionId: "26ss",
    category: "jacket",
    status: "sent_to_factory",
    ownerId: "choi-ceo",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    factory: "한성봉제",
    dueDate: "2026-08-18",
    version: 7,
    updatedAt: "4일 전",
    productionReady: 100,
    completed: ["Design", "Main Fabric", "Trim", "Label", "Colorway", "Size Spec", "Construction", "Quantity"],
    missing: [],
    specs: hoodieSpecs,
    nodes: [
      { id: "n-flat", type: "flat", title: "Denim Flat", x: 80, y: 40 },
      { id: "n-label", type: "label", title: "Leather Patch", x: 560, y: 40, linkedTo: "n-flat" },
      { id: "n-3d", type: "mockup3d", title: "3D Mockup", x: 80, y: 420, linkedTo: "n-flat" },
    ],
  },
  {
    id: "knit-09",
    name: "Knit Polo #09",
    code: "26SS-KN-09",
    collectionId: "26ss",
    category: "knit",
    status: "design_approved",
    ownerId: "kim-md",
    designerId: "lee-minji",
    productionManagerId: "park-prod",
    dueDate: "2026-09-03",
    version: 3,
    updatedAt: "어제",
    productionReady: 52,
    completed: ["Design", "Colorway"],
    missing: ["Main Fabric", "Size Spec", "Construction"],
    specs: emptySpecs("코튼 피케 니트 폴로. 박스 실루엣."),
    nodes: [{ id: "n-flat", type: "flat", title: "Polo Flat", x: 80, y: 40 }],
  },
];

const PERSONAL_PRODUCTS = new Set(["vest-06", "sweat-05"]);
const PR_PRODUCTS = new Set(["denim-08", "knit-09"]);

export const products: Product[] = seedProducts.map((p) => ({
  ...p,
  workspaceId: PERSONAL_PRODUCTS.has(p.id)
    ? PERSONAL_WORKSPACE_ID
    : PR_PRODUCTS.has(p.id)
      ? "faddit-pr"
      : "atelier-north",
  collaborators: defaultCollaborators(p),
  anyoneAccess: "view",
  workspaceAccess: "access",
  shareToken: p.id === "hoodie-01" ? "fac-hoodie-01" : undefined,
}));

export const comments: Comment[] = [
  {
    id: "c1",
    productId: "hoodie-01",
    authorId: "kim-md",
    body: "소매 폭 조금만 넓혀주세요. 드롭숄더 느낌이 더 나야 할 것 같아요.",
    mentions: ["lee-minji"],
    context: { mode: "design", target: "sleeve-r", label: "Right Sleeve" },
    createdAt: "오늘 11:10",
    isTask: true,
    taskStatus: "open",
    assigneeId: "lee-minji",
    dueDate: "2026-08-26",
  },
  {
    id: "c2",
    productId: "hoodie-01",
    authorId: "park-prod",
    body: "이 원단 500g으로 변경 가능한지 확인해주세요. 드레이프가 너무 얇습니다.",
    mentions: ["kim-md"],
    context: { mode: "specs", target: "material-main", label: "Main Fabric" },
    createdAt: "어제 16:40",
  },
  {
    id: "c3",
    productId: "pants-02",
    authorId: "lee-minji",
    body: "와이드 실루엣 유지하면서 밑단만 8mm 줄였어요.",
    mentions: [],
    context: { mode: "design", target: "body", label: "Body" },
    createdAt: "오늘 12:20",
  },
];

export const versions: Version[] = [
  {
    id: "v1",
    productId: "hoodie-01",
    number: 1,
    title: "초기 디자인",
    authorId: "lee-minji",
    createdAt: "8월 12일",
    changes: [{ field: "Design", from: "—", to: "Flat Drawing 생성" }],
    snapshot: {
      nodes: [{ id: "n-flat", type: "flat", title: "Hoodie Flat Drawing", x: 80, y: 40 }],
      specs: {
        ...hoodieSpecs,
        materials: hoodieSpecs.materials.map((m) => ({ ...m, weight: "380g" })),
        labels: [],
      },
    },
  },
  {
    id: "v2",
    productId: "hoodie-01",
    number: 2,
    title: "도식화 수정",
    authorId: "lee-minji",
    createdAt: "8월 15일",
    changes: [{ field: "Hood", from: "2-piece", to: "3-piece" }],
    snapshot: {
      nodes: [
        {
          id: "n-flat",
          type: "flat",
          title: "Hoodie Flat · 3-piece",
          x: 80,
          y: 40,
          hiddenParts: ["pocket"],
        },
      ],
      specs: {
        ...hoodieSpecs,
        materials: hoodieSpecs.materials.map((m) => ({ ...m, weight: "380g" })),
        labels: [],
      },
    },
  },
  {
    id: "v3",
    productId: "hoodie-01",
    number: 3,
    title: "라벨 변경",
    authorId: "lee-minji",
    createdAt: "8월 18일",
    changes: [{ field: "Main Label", from: "Label A", to: "Label B" }],
    snapshot: {
      nodes: [
        { id: "n-flat", type: "flat", title: "Hoodie Flat · 3-piece", x: 80, y: 40 },
        { id: "n-label", type: "label", title: "Label B", x: 560, y: 40, linkedTo: "n-flat" },
      ],
      specs: {
        ...hoodieSpecs,
        materials: hoodieSpecs.materials.map((m) => ({ ...m, weight: "380g" })),
        labels: hoodieSpecs.labels.map((l) => (l.kind === "main" ? { ...l, name: "Label B" } : l)),
      },
    },
  },
  {
    id: "v4",
    productId: "hoodie-01",
    number: 4,
    title: "원단 변경",
    authorId: "park-prod",
    createdAt: "오늘 09:40",
    changes: [
      { field: "Main Fabric", from: "Cotton 380g", to: "Cotton 420g" },
      { field: "Sleeve Width", from: "230mm", to: "240mm" },
    ],
    snapshot: {
      nodes: [
        { id: "n-flat", type: "flat", title: "Hoodie Flat Drawing", x: 80, y: 40 },
        { id: "n-label", type: "label", title: "Main Label", x: 560, y: 40, linkedTo: "n-flat" },
      ],
      specs: hoodieSpecs,
    },
  },
];

export const activities: Activity[] = [
  { id: "a1", productId: "hoodie-01", actorId: "kim-md", text: "Hoodie #01 Sleeve에 Comment를 남겼습니다.", createdAt: "오늘 11:10" },
  { id: "a2", productId: "tee-03", actorId: "lee-minji", text: "Graphic Tee #03 도식화를 수정했습니다.", createdAt: "오늘 10:30" },
  { id: "a3", productId: "pants-02", actorId: "park-prod", text: "Main Fabric이 Cotton 420g → 280g Twill로 변경되었습니다.", createdAt: "오늘 12:20" },
  { id: "a4", productId: "cargo-04", actorId: "choi-ceo", text: "Cargo Pants #04가 승인되었습니다.", createdAt: "2일 전 15:20" },
  { id: "a5", productId: "jacket-01", actorId: "park-prod", text: "Stadium Jacket #01 Specs Review를 요청했습니다.", createdAt: "오늘 09:12" },
  { id: "a6", productId: "sweat-05", actorId: "kim-md", text: "Sweatshirt #05를 추가했습니다.", createdAt: "오늘 09:40" },
  { id: "a7", productId: "vest-06", actorId: "kim-md", text: "Down Vest #06 기획을 시작했습니다.", createdAt: "어제" },
];

export const libraryAssets: LibraryAsset[] = [
  { id: "d1", workspaceId: "atelier-north", group: "design", kind: "Label", name: "ABC Main Label", meta: "Woven · 40×25" },
  { id: "d2", workspaceId: "atelier-north", group: "design", kind: "Label", name: "Care Label v3", meta: "Satin · 20×70" },
  { id: "d3", workspaceId: "atelier-north", group: "design", kind: "Graphic", name: "SS26 Back Print", meta: "Screen · 280×320" },
  { id: "d4", workspaceId: "atelier-north", group: "design", kind: "Template", name: "Oversized Hoodie", meta: "Product Template" },
  { id: "d5", workspaceId: PERSONAL_WORKSPACE_ID, group: "design", kind: "Graphic", name: "Arc Logo Draft", meta: "개인 스케치", usedAt: "3일 전" },
  { id: "d6", workspaceId: "faddit-pr", group: "design", kind: "Graphic", name: "PR Campaign Mark", meta: "Embroidery · 80×24" },
  { id: "d7", workspaceId: PERSONAL_WORKSPACE_ID, group: "design", kind: "Label", name: "Personal Main Label", meta: "Woven · 40×25", usedAt: "어제" },
  { id: "d8", workspaceId: PERSONAL_WORKSPACE_ID, group: "design", kind: "Template", name: "후디 디자인라인", meta: "Product Template", usedAt: "오늘 09:12" },
  { id: "d9", workspaceId: PERSONAL_WORKSPACE_ID, group: "design", kind: "Graphic", name: "무드보드.jpg", meta: "로컬 업로드", uploaded: true, usedAt: "오늘 14:20" },
  { id: "d10", workspaceId: "atelier-north", group: "design", kind: "Packaging", name: "Polybag Spec", meta: "OPP · 30×40" },
  { id: "d11", workspaceId: PERSONAL_WORKSPACE_ID, group: "production", kind: "Packaging", name: "행택 시안", meta: "크라프트 · 기타", usedAt: "오늘 10:30" },
  { id: "p1", workspaceId: "atelier-north", group: "production", kind: "Fabric", name: "Cotton Fleece 420g", meta: "C80/P20 · Daehan" },
  { id: "p2", workspaceId: "atelier-north", group: "production", kind: "Fabric", name: "Cotton Jersey 240g", meta: "C100 · Seoul Knit" },
  { id: "p3", workspaceId: "atelier-north", group: "production", kind: "Fabric", name: "Cotton Twill 280g", meta: "C100 · Busan Mill" },
  { id: "p4", workspaceId: "atelier-north", group: "production", kind: "Trim", name: "Metal Eyelet Ø8", meta: "Antique Nickel" },
  { id: "p5", workspaceId: PERSONAL_WORKSPACE_ID, group: "production", kind: "Fabric", name: "Sample Rib 1x1", meta: "개인 테스트", usedAt: "2일 전" },
  { id: "p6", workspaceId: "faddit-pr", group: "production", kind: "Hardware", name: "Snap Button 15mm", meta: "Matte Black" },
  { id: "p7", workspaceId: PERSONAL_WORKSPACE_ID, group: "production", kind: "Fabric", name: "Cotton Fleece 420g", meta: "C80/P20 · Daehan", usedAt: "오늘 11:10" },
  { id: "p8", workspaceId: PERSONAL_WORKSPACE_ID, group: "production", kind: "Trim", name: "Drawcord 8mm", meta: "Cotton · Ecru", usedAt: "어제" },
  { id: "p9", workspaceId: "atelier-north", group: "production", kind: "Rib", name: "Neck Rib 1x1", meta: "C100 · Seoul Knit" },
  { id: "d12", workspaceId: "faddit-packs", group: "design", kind: "Template", name: "제품 기본형", meta: "Product Template" },
  { id: "d13", workspaceId: "faddit-packs", group: "design", kind: "Label", name: "FADDIT Care Label", meta: "Satin · 20×70" },
  { id: "p10", workspaceId: "faddit-packs", group: "production", kind: "Fabric", name: "Organic Cotton 300g", meta: "C100 · Faddit Mill" },
  {
    id: "size-personal",
    workspaceId: PERSONAL_WORKSPACE_ID,
    group: "production",
    kind: "사이즈스펙",
    name: "개인 후디 사이즈 스펙",
    meta: "XS / S / M / L · 2항목 · CM",
    usedAt: "오늘 12:20",
    data: {
      sizeRange: ["XS", "S", "M", "L"],
      measurements: [
        { pom: "A", label: "총장", values: { XS: 62, S: 64, M: 66, L: 68 }, grade: 2, tolerance: "±1" },
        { pom: "B", label: "가슴단면", values: { XS: 53, S: 55, M: 57, L: 59 }, grade: 2, tolerance: "±1" },
      ],
      unit: "CM",
    },
  },
  {
    id: "size-atelier",
    workspaceId: "atelier-north",
    group: "production",
    kind: "사이즈스펙",
    name: "Atelier 후디 사이즈 스펙",
    meta: "S / M / L / XL / XXL · 2항목 · CM",
    data: {
      sizeRange: ["S", "M", "L", "XL", "XXL"],
      measurements: [
        { pom: "A", label: "소매길이", values: { S: 58, M: 60, L: 62, XL: 64, XXL: 66 }, grade: 2, tolerance: "±1" },
        { pom: "B", label: "밑단폭", values: { S: 50, M: 52, L: 54, XL: 56, XXL: 58 }, grade: 2, tolerance: "±1" },
      ],
      unit: "CM",
    },
  },
  {
    id: "qty-personal",
    workspaceId: PERSONAL_WORKSPACE_ID,
    group: "production",
    kind: "수량",
    name: "개인 후디 색상별 수량",
    meta: "1색상 · 합계 200",
    usedAt: "5일 전",
    data: {
      sizeRange: ["S", "M", "L", "XL"],
      colorways: [
        {
          name: "Ivory",
          hex: "#F5F0E8",
          qtyBySize: { S: 40, M: 70, L: 60, XL: 30 },
          memo: "개인 라이브러리",
        },
      ],
    },
  },
  {
    id: "qty-atelier",
    workspaceId: "atelier-north",
    group: "production",
    kind: "수량",
    name: "Atelier 후디 색상별 수량",
    meta: "1색상 · 합계 180",
    data: {
      sizeRange: ["S", "M", "L", "XL"],
      colorways: [
        {
          name: "Sage",
          hex: "#8B9A7D",
          qtyBySize: { S: 30, M: 60, L: 60, XL: 30 },
          memo: "Atelier 라이브러리",
        },
      ],
    },
  },
];

export const trashedItems: TrashedItem[] = [
  { id: "t1", workspaceId: "atelier-north", name: "Old Care Label v1", kind: "라벨", deletedAt: "3일 전" },
  { id: "t2", workspaceId: PERSONAL_WORKSPACE_ID, name: "Sample Rib swatch", kind: "시보리원단", deletedAt: "어제" },
  { id: "t3", workspaceId: "atelier-north", name: "Hoodie #00 제품", kind: "제품", deletedAt: "오늘" },
  { id: "t4", workspaceId: "personal-memo", name: "메모 초안.txt", kind: "문서", deletedAt: "5일 전" },
  { id: "t5", workspaceId: "faddit-packs", name: "구버전 제품 템플릿", kind: "템플릿", deletedAt: "일주일 전" },
  { id: "t6", workspaceId: "faddit-pr", name: "FDD_Templates v0", kind: "템플릿", deletedAt: "2일 전" },
];

export function userById(id: string) {
  return users.find((u) => u.id === id);
}

export function workspaceById(id: string, list: Workspace[] = workspaces) {
  return list.find((w) => w.id === id);
}

export function teamById(id: string, list: Team[] = teams) {
  return list.find((t) => t.id === id);
}
