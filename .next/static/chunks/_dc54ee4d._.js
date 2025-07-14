(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": (()=>cn)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": (()=>Button),
    "buttonVariants": (()=>buttonVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/factories.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "factories": (()=>factories)
});
const factories = [
    // 1~3: 기존 샘플
    {
        id: "1",
        name: "서울패션공장",
        ownerUserId: "factory1",
        region: "서울",
        items: [
            "티셔츠",
            "셔츠",
            "원피스"
        ],
        minOrder: 100,
        description: "서울 도심에 위치한 20년 경력의 봉제공장입니다.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        contact: "02-1234-5678",
        lat: 37.5665,
        lng: 126.9780,
        kakaoUrl: "https://open.kakao.com/o/some-link1",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "2",
        name: "부산의류제작소",
        ownerUserId: "factory2",
        region: "부산",
        items: [
            "바지",
            "점퍼"
        ],
        minOrder: 200,
        description: "최신 설비와 숙련된 인력을 보유한 부산 봉제공장.",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
        contact: "051-9876-5432",
        lat: 35.1796,
        lng: 129.0756,
        kakaoUrl: "https://open.kakao.com/o/some-link2",
        processes: [
            "샘플",
            "자수"
        ]
    },
    {
        id: "3",
        name: "대구섬유공방",
        ownerUserId: "factory3",
        region: "대구",
        items: [
            "코트",
            "자켓"
        ],
        minOrder: 50,
        description: "소량 생산도 가능한 대구의 섬유/봉제 전문 공방.",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
        contact: "053-222-3333",
        lat: 35.8714,
        lng: 128.6014,
        kakaoUrl: "https://open.kakao.com/o/some-link3",
        processes: [
            "QC",
            "다이마루"
        ]
    },
    {
        id: "4",
        name: "인천의류센터",
        ownerUserId: "factory4",
        region: "인천",
        items: [
            "셔츠",
            "바지"
        ],
        minOrder: 120,
        description: "인천에서 다양한 의류를 생산하는 중형 공장입니다.",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
        contact: "032-111-2222",
        lat: 37.4563,
        lng: 126.7052,
        kakaoUrl: "https://open.kakao.com/o/some-link4",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "5",
        name: "광주패션하우스",
        ownerUserId: "factory5",
        region: "광주",
        items: [
            "원피스",
            "스커트"
        ],
        minOrder: 80,
        description: "여성복 전문, 소량 주문도 환영합니다.",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        contact: "062-333-4444",
        lat: 35.1595,
        lng: 126.8526,
        kakaoUrl: "https://open.kakao.com/o/some-link5",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "6",
        name: "대전의상공방",
        ownerUserId: "factory6",
        region: "대전",
        items: [
            "아우터",
            "점퍼"
        ],
        minOrder: 150,
        description: "최신 설비로 고품질 아우터를 제작합니다.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        contact: "042-555-6666",
        lat: 36.3504,
        lng: 127.3845,
        kakaoUrl: "https://open.kakao.com/o/some-link6",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "7",
        name: "울산의류공장",
        ownerUserId: "factory7",
        region: "울산",
        items: [
            "티셔츠",
            "셔츠"
        ],
        minOrder: 90,
        description: "울산 지역 소량/대량 모두 가능.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
        contact: "052-777-8888",
        lat: 35.5384,
        lng: 129.3114,
        kakaoUrl: "https://open.kakao.com/o/some-link7",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "8",
        name: "경기어패럴",
        ownerUserId: "factory8",
        region: "경기",
        items: [
            "바지",
            "코트"
        ],
        minOrder: 200,
        description: "경기도 최대 규모의 봉제공장.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        contact: "031-888-9999",
        lat: 37.4138,
        lng: 127.5183,
        kakaoUrl: "https://open.kakao.com/o/some-link8",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "9",
        name: "강원섬유",
        ownerUserId: "factory9",
        region: "강원",
        items: [
            "자켓",
            "셔츠"
        ],
        minOrder: 60,
        description: "강원도에서 신속한 납기와 꼼꼼한 품질!",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
        contact: "033-101-2020",
        lat: 37.8228,
        lng: 128.1555,
        kakaoUrl: "https://open.kakao.com/o/some-link9",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "10",
        name: "충북패션",
        ownerUserId: "factory10",
        region: "충북",
        items: [
            "티셔츠",
            "스커트"
        ],
        minOrder: 110,
        description: "충북 청주 중심의 봉제공장.",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
        contact: "043-303-4040",
        lat: 36.6424,
        lng: 127.4890,
        kakaoUrl: "https://open.kakao.com/o/some-link10",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "11",
        name: "충남의류센터",
        ownerUserId: "factory11",
        region: "충남",
        items: [
            "셔츠",
            "바지"
        ],
        minOrder: 130,
        description: "충남 아산의 봉제공장, 빠른 납기 보장.",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
        contact: "041-505-6060",
        lat: 36.7926,
        lng: 127.1350,
        kakaoUrl: "https://open.kakao.com/o/some-link11",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "12",
        name: "전북패션공장",
        ownerUserId: "factory12",
        region: "전북",
        items: [
            "원피스",
            "블라우스"
        ],
        minOrder: 90,
        description: "전북 전주에서 여성복 전문 생산.",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        contact: "063-606-7070",
        lat: 35.8242,
        lng: 127.1477,
        kakaoUrl: "https://open.kakao.com/o/some-link12",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "13",
        name: "전남의상공방",
        ownerUserId: "factory13",
        region: "전남",
        items: [
            "아우터",
            "점퍼"
        ],
        minOrder: 100,
        description: "전남 목포, 소량 생산도 환영.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        contact: "061-808-9090",
        lat: 34.8118,
        lng: 126.3922,
        kakaoUrl: "https://open.kakao.com/o/some-link13",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "14",
        name: "경북패션센터",
        ownerUserId: "factory14",
        region: "경북",
        items: [
            "티셔츠",
            "셔츠"
        ],
        minOrder: 140,
        description: "경북 구미, 대량 생산 특화.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
        contact: "054-111-2121",
        lat: 36.1195,
        lng: 128.3446,
        kakaoUrl: "https://open.kakao.com/o/some-link14",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "15",
        name: "경남의류공장",
        ownerUserId: "factory15",
        region: "경남",
        items: [
            "바지",
            "코트"
        ],
        minOrder: 120,
        description: "경남 창원, 다양한 품목 생산.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        contact: "055-313-4141",
        lat: 35.2285,
        lng: 128.6811,
        kakaoUrl: "https://open.kakao.com/o/some-link15",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "16",
        name: "제주패션공방",
        ownerUserId: "factory16",
        region: "제주",
        items: [
            "원피스",
            "셔츠"
        ],
        minOrder: 70,
        description: "제주도에서 만나는 감각적인 디자인 봉제공장.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        contact: "064-707-8080",
        lat: 33.4996,
        lng: 126.5312,
        kakaoUrl: "https://open.kakao.com/o/some-link16",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "17",
        name: "서울의류마을",
        ownerUserId: "factory17",
        region: "서울",
        items: [
            "티셔츠",
            "자켓"
        ],
        minOrder: 100,
        description: "서울 동대문, 트렌디한 디자인 전문.",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
        contact: "02-1717-1717",
        lat: 37.5700,
        lng: 127.0095,
        kakaoUrl: "https://open.kakao.com/o/some-link17",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "18",
        name: "부산패션타운",
        ownerUserId: "factory18",
        region: "부산",
        items: [
            "셔츠",
            "바지"
        ],
        minOrder: 120,
        description: "부산 해운대, 남성복 대량 생산.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        contact: "051-1818-1818",
        lat: 35.1632,
        lng: 129.1636,
        kakaoUrl: "https://open.kakao.com/o/some-link18",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "19",
        name: "대구의상타운",
        ownerUserId: "factory19",
        region: "대구",
        items: [
            "원피스",
            "스커트"
        ],
        minOrder: 80,
        description: "대구 동성로, 여성복 소량 주문 환영.",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        contact: "053-1919-1919",
        lat: 35.8686,
        lng: 128.5945,
        kakaoUrl: "https://open.kakao.com/o/some-link19",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "20",
        name: "인천패션스튜디오",
        ownerUserId: "factory20",
        region: "인천",
        items: [
            "아우터",
            "점퍼"
        ],
        minOrder: 150,
        description: "인천 송도, 고급 아우터 전문.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        contact: "032-2020-2020",
        lat: 37.3891,
        lng: 126.6445,
        kakaoUrl: "https://open.kakao.com/o/some-link20",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "21",
        name: "광주의류마켓",
        ownerUserId: "factory21",
        region: "광주",
        items: [
            "티셔츠",
            "셔츠"
        ],
        minOrder: 110,
        description: "광주 남구, 다양한 품목 생산.",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
        contact: "062-2121-2121",
        lat: 35.1330,
        lng: 126.9020,
        kakaoUrl: "https://open.kakao.com/o/some-link21",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "22",
        name: "대전패션스퀘어",
        ownerUserId: "factory22",
        region: "대전",
        items: [
            "바지",
            "코트"
        ],
        minOrder: 130,
        description: "대전 유성구, 남성복/여성복 모두 가능.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
        contact: "042-2222-2222",
        lat: 36.3622,
        lng: 127.3568,
        kakaoUrl: "https://open.kakao.com/o/some-link22",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "23",
        name: "울산의상마을",
        ownerUserId: "factory23",
        region: "울산",
        items: [
            "자켓",
            "셔츠"
        ],
        minOrder: 90,
        description: "울산 북구, 소량 생산 특화.",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
        contact: "052-2323-2323",
        lat: 35.5833,
        lng: 129.3600,
        kakaoUrl: "https://open.kakao.com/o/some-link23",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "24",
        name: "경기의류타운",
        ownerUserId: "factory24",
        region: "경기",
        items: [
            "티셔츠",
            "스커트"
        ],
        minOrder: 200,
        description: "경기 수원, 대량 생산 가능.",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80",
        contact: "031-2424-2424",
        lat: 37.2636,
        lng: 127.0286,
        kakaoUrl: "https://open.kakao.com/o/some-link24",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "25",
        name: "강원의류센터",
        ownerUserId: "factory25",
        region: "강원",
        items: [
            "원피스",
            "블라우스"
        ],
        minOrder: 60,
        description: "강원 원주, 꼼꼼한 품질 관리.",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        contact: "033-2525-2525",
        lat: 37.3422,
        lng: 127.9207,
        kakaoUrl: "https://open.kakao.com/o/some-link25",
        processes: [
            "봉제",
            "나염"
        ]
    },
    {
        id: "26",
        name: "충북의상마을",
        ownerUserId: "factory26",
        region: "충북",
        items: [
            "아우터",
            "점퍼"
        ],
        minOrder: 110,
        description: "충북 충주, 소량/대량 모두 가능.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        contact: "043-2626-2626",
        lat: 36.9910,
        lng: 127.9258,
        kakaoUrl: "https://open.kakao.com/o/some-link26",
        processes: [
            "봉제",
            "나염"
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/matching/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MatchingPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/factories.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// 8단계 질문/선택지 샘플 데이터
const QUESTIONS = [
    {
        question: "어떤 원단을 원하시나요?",
        options: [
            "나염",
            "직기/우븐",
            "다이마루",
            "편물",
            "데님",
            "전사"
        ]
    },
    {
        question: "주문 수량은 얼마인가요?",
        options: [
            "100장 미만",
            "100~500장",
            "500~1000장",
            "1000장 이상"
        ]
    },
    {
        question: "희망 납기일은 언제인가요?",
        options: [
            "1주일 이내",
            "2주 이내",
            "1달 이내",
            "상관없음"
        ]
    },
    {
        question: "원하는 봉제 방식은?",
        options: [
            "오버록",
            "쌍침",
            "삼봉",
            "오바로크+쌍침",
            "기타"
        ]
    },
    {
        question: "의류 종류는 무엇인가요?",
        options: [
            "티셔츠",
            "맨투맨",
            "후드",
            "바지",
            "원피스",
            "기타"
        ]
    },
    {
        question: "예상 단가는?",
        options: [
            "1만원 미만",
            "1~2만원",
            "2~3만원",
            "3만원 이상"
        ]
    },
    {
        question: "특별히 원하는 공장 조건이 있나요?",
        options: [
            "소량생산 가능",
            "빠른 납기",
            "고품질",
            "저렴한 단가",
            "상관없음"
        ]
    }
];
function MatchingPage() {
    _s();
    // 현재 질문 인덱스
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // 사용자가 선택한 답변들
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedOptions, setSelectedOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // 채팅 메시지(질문/답변 순서대로)
    const [chat, setChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            type: "question",
            text: QUESTIONS[0].question
        }
    ]);
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [showLoginModal, setShowLoginModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showResult, setShowResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recommended, setRecommended] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // 선택지 클릭 시
    const handleOptionToggle = (option)=>{
        setSelectedOptions((prev)=>prev.includes(option) ? prev.filter((o)=>o !== option) : [
                ...prev,
                option
            ]);
    };
    const handleConfirm = ()=>{
        if (selectedOptions.length === 0) return;
        const newAnswers = [
            ...answers,
            selectedOptions
        ];
        setAnswers(newAnswers);
        setChat((prev)=>[
                ...prev,
                {
                    type: "answer",
                    text: selectedOptions.join(", ")
                }
            ]);
        setSelectedOptions([]);
        // 다음 질문이 있으면 추가
        if (step + 1 < QUESTIONS.length) {
            setTimeout(()=>{
                setChat((prev)=>[
                        ...prev,
                        {
                            type: "question",
                            text: QUESTIONS[step + 1].question
                        }
                    ]);
                setStep((prev)=>prev + 1);
            }, 400);
        } else {
            // 8개 완료 시 추천 결과 노출
            setLoading(true);
            setTimeout(()=>{
                const rec = getRecommendedFactories(newAnswers.map((a)=>a.join(", ")));
                setRecommended(rec);
                setLoading(false);
                setShowResult(true);
            }, 1500);
        }
    };
    // 건너뛰기(선택 없이 다음 단계)
    const handleSkip = ()=>{
        const newAnswers = [
            ...answers,
            []
        ];
        setAnswers(newAnswers);
        setChat((prev)=>[
                ...prev,
                {
                    type: "answer",
                    text: "(건너뜀)"
                }
            ]);
        setSelectedOptions([]);
        if (step + 1 < QUESTIONS.length) {
            setTimeout(()=>{
                setChat((prev)=>[
                        ...prev,
                        {
                            type: "question",
                            text: QUESTIONS[step + 1].question
                        }
                    ]);
                setStep((prev)=>prev + 1);
            }, 400);
        } else {
            setLoading(true);
            setTimeout(()=>{
                const rec = getRecommendedFactories(newAnswers.map((a)=>a.join(", ")));
                setRecommended(rec);
                setLoading(false);
                setShowResult(true);
            }, 1500);
        }
    };
    // 추천 알고리즘: 답변과 공장 데이터 매칭 점수 계산
    function getRecommendedFactories(answers) {
        // 질문별로 어떤 필드와 매칭할지 정의
        // 0: 원단/공정(공장.processes), 1: 수량(minOrder), 2: 납기(미사용), 3: 봉제방식(processes),
        // 4: 의류종류(items), 5: 단가(미사용), 6: 조건(processes, minOrder), 7: 기타(미사용)
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["factories"].map((f)=>{
            let score = 0;
            // 0: 원단/공정
            if (f.processes.some((p)=>answers[0] && answers[0].includes(p))) score++;
            // 1: 수량
            if (answers[1]) {
                if (answers[1] === "100장 미만" && f.minOrder <= 100 || answers[1] === "100~500장" && f.minOrder <= 500 || answers[1] === "500~1000장" && f.minOrder <= 1000 || answers[1] === "1000장 이상" && f.minOrder > 1000) score++;
            }
            // 3: 봉제방식
            if (f.processes.some((p)=>answers[3] && answers[3].includes(p))) score++;
            // 4: 의류종류
            if (f.items.some((i)=>answers[4] && answers[4].includes(i))) score++;
            // 6: 특별조건
            if (answers[6]) {
                if (answers[6].includes("소량") && f.minOrder <= 100 || answers[6].includes("빠른 납기") && f.description.includes("빠른 납기") || answers[6].includes("고품질") && f.description.includes("고품질") || answers[6].includes("저렴한 단가") && f.description.includes("저렴")) score++;
            }
            return {
                ...f,
                score
            };
        }).sort((a, b)=>b.score - a.score).slice(0, 3);
    }
    // 추천 결과 카드 UI
    function renderResultCards() {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex flex-col items-center justify-center min-h-[500px] animate-fade-in",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-2xl font-bold mb-6",
                    children: "가장 적합한 봉제공장 3곳을 추천드려요!"
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 168,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-3xl",
                    children: recommended.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-200 w-full",
                            children: [
                                f.image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: f.image,
                                    alt: f.name,
                                    className: "w-full h-40 object-cover rounded-lg mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 173,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-lg font-bold mb-2",
                                    children: f.name
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-500 text-sm mb-2",
                                    children: [
                                        "매칭 점수: ",
                                        f.score
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 176,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-700 mb-2",
                                    children: f.description
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-400 text-xs mb-4",
                                    children: [
                                        "최소 주문: ",
                                        f.minOrder,
                                        "장"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    className: "w-full mt-auto",
                                    onClick: ()=>router.push(`/factories/${f.id}`),
                                    children: "의뢰하기"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 179,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, f.id, true, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 169,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/matching/page.tsx",
            lineNumber: 167,
            columnNumber: 7
        }, this);
    }
    // 로딩 스피너 UI
    function renderLoading() {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex flex-col items-center justify-center min-h-[500px] animate-fade-in",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-16 h-16 border-4 border-gray-300 border-t-[#222222] rounded-full animate-spin mb-6"
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-lg font-semibold",
                    children: "추천 결과를 분석 중입니다..."
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 194,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/matching/page.tsx",
            lineNumber: 192,
            columnNumber: 7
        }, this);
    }
    // 이전 단계로 돌아가기 (수정)
    const handleEdit = (editStep)=>{
        setStep(editStep);
        setSelectedOptions(answers[editStep] || []);
        setAnswers(answers.slice(0, editStep));
        setChat(chat.slice(0, 1 + editStep * 2)); // 질문/답변 쌍이므로
        setShowResult(false);
        setLoading(false);
    };
    // 왼쪽: 질문/선택지, 오른쪽: 채팅
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-[1200px] mx-auto min-h-screen bg-gray-50 flex flex-row gap-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-row gap-8 flex-1 items-start justify-center mt-12 transition-opacity duration-700 ${showResult || loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full max-w-xl bg-white rounded-xl shadow-md p-8 flex flex-col gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xl font-bold mb-2",
                                children: "AI 매칭"
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-500 text-sm mb-4",
                                children: "몇 가지 정보를 알려주시면, 가장 적합한 3개의 봉제공장을 추천해드립니다."
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mb-4",
                                children: QUESTIONS.map((_, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `h-1 w-8 rounded-full ${idx <= step ? "bg-[#222222]" : "bg-gray-200"}`
                                    }, idx, false, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-gray-400 mb-2",
                                children: [
                                    step + 1,
                                    " of ",
                                    QUESTIONS.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-lg font-semibold mb-4",
                                children: QUESTIONS[step].question
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-3 mb-2",
                                children: QUESTIONS[step].options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `rounded-lg py-4 px-6 text-base font-medium border transition flex items-center justify-center gap-2
                  ${selectedOptions.includes(option) ? "bg-[#222222] text-white border-[#222222]" : "bg-white text-[#222222] border-gray-200 hover:bg-gray-100"}
                `,
                                        onClick: ()=>handleOptionToggle(option),
                                        children: option
                                    }, option, false, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center mt-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "text-sm underline text-[#222222]",
                                        onClick: ()=>router.push("/"),
                                        children: "나가기"
                                    }, void 0, false, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                className: "text-[#222222]",
                                                onClick: handleSkip,
                                                children: "건너뛰기"
                                            }, void 0, false, {
                                                fileName: "[project]/app/matching/page.tsx",
                                                lineNumber: 245,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                className: "bg-[#222222] text-white px-6",
                                                onClick: handleConfirm,
                                                disabled: selectedOptions.length === 0,
                                                children: "다음"
                                            }, void 0, false, {
                                                fileName: "[project]/app/matching/page.tsx",
                                                lineNumber: 246,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/matching/page.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full max-w-md bg-white rounded-xl shadow-md p-6 min-h-[500px] flex flex-col gap-2",
                        children: chat.map((msg, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex ${msg.type === "question" ? "justify-start" : "justify-end"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `relative px-4 py-2 rounded-2xl text-base ${msg.type === "question" ? "bg-gray-100 text-gray-800" : "bg-[#222222] text-white"}`,
                                    children: [
                                        msg.text,
                                        msg.type === "answer" && idx === chat.findLastIndex((m)=>m.type === "answer") && step > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "absolute right-2 bottom-[-18px] text-xs text-gray-400 underline hover:text-[#222222]",
                                            onClick: ()=>handleEdit(Math.floor(idx / 2)),
                                            children: "수정"
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 264,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 260,
                                    columnNumber: 15
                                }, this)
                            }, idx, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 259,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/matching/page.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    showLoginModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl shadow-lg p-8 max-w-xs w-full text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-lg font-bold mb-2",
                                    children: "로그인 후 이용 가능합니다"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 279,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-500 mb-4",
                                    children: "의뢰하기는 로그인 후 이용하실 수 있습니다."
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    className: "w-full mb-2",
                                    onClick: ()=>router.push("/sign-in"),
                                    children: "로그인 화면으로 이동"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 281,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    className: "w-full",
                                    onClick: ()=>setShowLoginModal(false),
                                    children: "닫기"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 282,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 278,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/matching/page.tsx",
                        lineNumber: 277,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center bg-gray-50 z-50 transition-opacity duration-700 animate-fade-in",
                children: renderLoading()
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 289,
                columnNumber: 9
            }, this),
            showResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center bg-gray-50 z-50 transition-opacity duration-700 animate-fade-in",
                children: renderResultCards()
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/matching/page.tsx",
        lineNumber: 211,
        columnNumber: 5
    }, this);
}
_s(MatchingPage, "RFrE2bh99XFAq0bIEWPkF4FcvIw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = MatchingPage;
var _c;
__turbopack_context__.k.register(_c, "MatchingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_dc54ee4d._.js.map