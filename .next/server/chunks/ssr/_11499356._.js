module.exports = {

"[project]/lib/factories.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
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
}}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": (()=>cn)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}}),
"[project]/components/ui/card.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": (()=>Card),
    "CardAction": (()=>CardAction),
    "CardContent": (()=>CardContent),
    "CardDescription": (()=>CardDescription),
    "CardFooter": (()=>CardFooter),
    "CardHeader": (()=>CardHeader),
    "CardTitle": (()=>CardTitle)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}}),
"[project]/components/ui/button.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": (()=>Button),
    "buttonVariants": (()=>buttonVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
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
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
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
;
}}),
"[project]/components/FactoryMap.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>FactoryMap)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-google-maps/api/dist/esm.js [app-ssr] (ecmascript)");
"use client";
;
;
const defaultCenter = {
    lat: 36.5,
    lng: 127.8
}; // 한반도 중심
function FactoryMap({ factories, selectedFactoryId, onSelectFactory, height = "420px" }) {
    const { isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useJsApiLoader"])({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });
    if (!isLoaded) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center h-[200px]",
        children: "지도를 불러오는 중..."
    }, void 0, false, {
        fileName: "[project]/components/FactoryMap.tsx",
        lineNumber: 19,
        columnNumber: 25
    }, this);
    const selected = factories.find((f)=>f.id === selectedFactoryId) || factories[0];
    const center = selected ? {
        lat: selected.lat,
        lng: selected.lng
    } : defaultCenter;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleMap"], {
        mapContainerStyle: {
            width: "100%",
            height
        },
        center: center,
        zoom: 7,
        options: {
            disableDefaultUI: true,
            clickableIcons: false
        },
        children: factories.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Marker"], {
                position: {
                    lat: f.lat,
                    lng: f.lng
                },
                onClick: ()=>onSelectFactory(f.id),
                icon: f.id === selectedFactoryId ? {
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40)
                } : undefined
            }, f.id, false, {
                fileName: "[project]/components/FactoryMap.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/FactoryMap.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}}),
"[project]/app/factories/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>FactoriesPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/factories.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FactoryMap$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FactoryMap.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ArrowPathIcon.js [app-ssr] (ecmascript) <export default as ArrowPathIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-ssr] (ecmascript) <export default as Map>");
"use client";
;
;
;
;
;
;
;
;
;
;
const processOptions = [
    "봉제",
    "다이마루",
    "직기",
    "샘플",
    "나염",
    "자수",
    "QC"
];
const itemOptions = [
    "티셔츠",
    "셔츠",
    "원피스",
    "바지",
    "점퍼",
    "코트",
    "자켓"
];
const regionOptions = [
    "서울",
    "부산",
    "대구"
];
// 태그별 색상 매핑 함수
function getTagColor(tag) {
    switch(tag){
        case "봉제":
            return "bg-blue-100 text-blue-700";
        case "나염":
            return "bg-orange-100 text-orange-700";
        case "자수":
            return "bg-green-100 text-green-700";
        case "샘플":
            return "bg-purple-100 text-purple-700";
        case "QC":
            return "bg-pink-100 text-pink-700";
        case "다이마루":
            return "bg-yellow-100 text-yellow-700";
        case "직기":
            return "bg-cyan-100 text-cyan-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}
function FactoriesPage() {
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedProcess, setSelectedProcess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedRegion, setSelectedRegion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedItem, setSelectedItem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("list");
    const perPage = 9;
    const [selectedFactoryId, setSelectedFactoryId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["factories"][0]?.id || "");
    // 아코디언 열림/닫힘 상태 관리
    const [openFilter, setOpenFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        process: true,
        region: true,
        item: true,
        moq: false,
        equipment: false
    });
    // 샘플 필터링(실제 필터링 로직은 추후 확장)
    let filtered = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["factories"].filter((f)=>{
        return (!search || f.name.includes(search) || f.description.includes(search)) && (selectedRegion.length === 0 || selectedRegion.includes(f.region)) && (selectedItem.length === 0 || f.items.some((i)=>selectedItem.includes(i)));
    });
    const totalPages = Math.ceil(filtered.length / perPage);
    filtered = filtered.slice((page - 1) * perPage, page * perPage);
    // 뱃지(선택된 필터)
    const badges = [
        ...selectedProcess.map((p)=>({
                value: p,
                type: "process"
            })),
        ...selectedRegion.map((r)=>({
                value: r,
                type: "region"
            })),
        ...selectedItem.map((i)=>({
                value: i,
                type: "item"
            }))
    ];
    // 지도 뷰에서 선택된 공장 정보
    const selectedFactory = filtered.find((f)=>f.id === selectedFactoryId) || filtered[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-[1200px] mx-auto py-16 flex flex-col gap-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-[40px] font-extrabold text-gray-900 mb-2",
                        children: "봉제공장 찾기"
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-500",
                        children: "퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요."
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "w-64 shrink-0 hidden lg:block",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl mb-6 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-bold mb-4 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "필터"
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 84,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setSelectedProcess([]);
                                                setSelectedRegion([]);
                                                setSelectedItem([]);
                                            },
                                            className: "flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition",
                                            title: "필터 초기화",
                                            children: [
                                                typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"] !== 'undefined' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-lg",
                                                    children: "↻"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "sr-only",
                                                    children: "초기화"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 95,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                    className: "my-3 border-gray-200"
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex justify-between items-center font-bold text-[16px] mb-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        process: !f.process
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center",
                                                    children: [
                                                        "공정",
                                                        selectedProcess.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full",
                                                            children: selectedProcess.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 104,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 102,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "inline-block",
                                                        transform: openFilter.process ? "none" : "rotate(180deg)"
                                                    },
                                                    children: "⌃"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 101,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.process && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: processOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selectedProcess.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full px-4",
                                                    onClick: ()=>setSelectedProcess(selectedProcess.includes(opt) ? selectedProcess.filter((p)=>p !== opt) : [
                                                            ...selectedProcess,
                                                            opt
                                                        ]),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 112,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 110,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex justify-between items-center font-bold text-[16px] mb-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        region: !f.region
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center",
                                                    children: [
                                                        "지역",
                                                        selectedRegion.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full",
                                                            children: selectedRegion.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 123,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "inline-block",
                                                        transform: openFilter.region ? "none" : "rotate(180deg)"
                                                    },
                                                    children: "⌃"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: regionOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selectedRegion.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full px-4",
                                                    onClick: ()=>setSelectedRegion(selectedRegion.includes(opt) ? selectedRegion.filter((r)=>r !== opt) : [
                                                            ...selectedRegion,
                                                            opt
                                                        ]),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex justify-between items-center font-bold text-[16px] mb-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        item: !f.item
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center",
                                                    children: [
                                                        "주요 품목",
                                                        selectedItem.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-2 bg-black text-white w-5 h-5 text-xs flex items-center justify-center rounded-full",
                                                            children: selectedItem.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 142,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "inline-block",
                                                        transform: openFilter.item ? "none" : "rotate(180deg)"
                                                    },
                                                    children: "⌃"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.item && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: itemOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selectedItem.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full px-4",
                                                    onClick: ()=>setSelectedItem(selectedItem.includes(opt) ? selectedItem.filter((i)=>i !== opt) : [
                                                            ...selectedItem,
                                                            opt
                                                        ]),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 148,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex justify-between items-center font-bold text-[16px] mb-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        moq: !f.moq
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "MOQ(최소수량)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "inline-block",
                                                        transform: openFilter.moq ? "none" : "rotate(180deg)"
                                                    },
                                                    children: "⌃"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 158,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.moq && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            className: "border rounded px-3 py-2 w-full",
                                            placeholder: "예: 100",
                                            disabled: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 157,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex justify-between items-center font-bold text-[16px] mb-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        equipment: !f.equipment
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "주요 설비"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "inline-block",
                                                        transform: openFilter.equipment ? "none" : "rotate(180deg)"
                                                    },
                                                    children: "⌃"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 168,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.equipment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            className: "border rounded px-3 py-2 w-full",
                                            placeholder: "예: 오버록",
                                            disabled: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 173,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/factories/page.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        placeholder: "공장명, 키워드로 검색하세요.",
                                        className: "flex-1 min-w-0 border rounded-[0.625rem] px-4 py-2 focus:border-black focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex bg-gray-100 rounded-lg p-1 mt-2 md:mt-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'list' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`,
                                                onClick: ()=>setView('list'),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                                        size: 28,
                                                        strokeWidth: view === 'list' ? 2.5 : 2,
                                                        className: `${view === 'list' ? 'text-[#222]' : 'text-[#bbb]'} scale-80`
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 191,
                                                        columnNumber: 17
                                                    }, this),
                                                    "목록"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 187,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'map' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`,
                                                onClick: ()=>setView('map'),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                                        size: 28,
                                                        strokeWidth: view === 'map' ? 2.5 : 2,
                                                        className: `${view === 'map' ? 'text-[#222]' : 'text-[#bbb]'} scale-80`
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 198,
                                                        columnNumber: 17
                                                    }, this),
                                                    "지도"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 194,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 186,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            badges.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 mb-4",
                                children: [
                                    badges.map((b, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-black text-white rounded-full px-3 py-1 text-[14px] font-semibold flex items-center gap-1",
                                            children: [
                                                b.value,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        if (b.type === "process") setSelectedProcess(selectedProcess.filter((p)=>p !== b.value));
                                                        if (b.type === "region") setSelectedRegion(selectedRegion.filter((r)=>r !== b.value));
                                                        if (b.type === "item") setSelectedItem(selectedItem.filter((i)=>i !== b.value));
                                                    },
                                                    className: "ml-1",
                                                    children: "×"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 209,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 207,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: "ghost",
                                        onClick: ()=>{
                                            setSelectedProcess([]);
                                            setSelectedRegion([]);
                                            setSelectedItem([]);
                                        },
                                        children: "전체 해제"
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 216,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this),
                            view === "list" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
                                        children: [
                                            filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "col-span-3 text-center text-gray-400",
                                                children: "검색 결과가 없습니다."
                                            }, void 0, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 224,
                                                columnNumber: 19
                                            }, this),
                                            filtered.map((factory)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/factories/${factory.id}`,
                                                    className: "group",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                                        className: "rounded-xl shadow-sm border bg-white hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                                            className: "flex-1 flex flex-col p-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    src: factory.image,
                                                                    alt: factory.name,
                                                                    width: 400,
                                                                    height: 128,
                                                                    className: "rounded-xl mb-3 h-32 w-full object-cover"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex gap-2 mb-2 flex-wrap",
                                                                    children: [
                                                                        factory.processes?.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `rounded px-2 py-1 text-xs font-bold ${getTagColor(tag)}`,
                                                                                children: tag
                                                                            }, tag, false, {
                                                                                fileName: "[project]/app/factories/page.tsx",
                                                                                lineNumber: 234,
                                                                                columnNumber: 29
                                                                            }, this)),
                                                                        factory.items.slice(0, 2).map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs",
                                                                                children: i
                                                                            }, i, false, {
                                                                                fileName: "[project]/app/factories/page.tsx",
                                                                                lineNumber: 237,
                                                                                columnNumber: 63
                                                                            }, this))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 231,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "font-bold text-base mb-1 group-hover:text-toss-blue transition-colors",
                                                                    children: factory.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 239,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-500 mb-1 line-clamp-2",
                                                                    children: factory.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 240,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-500 mb-1",
                                                                    children: [
                                                                        "MOQ(최소수량): ",
                                                                        factory.minOrder
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 241,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-400",
                                                                    children: [
                                                                        "주요 품목: ",
                                                                        factory.items.join(", ")
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 242,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 229,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 21
                                                    }, this)
                                                }, factory.id, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 222,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-center items-center gap-2 mt-8",
                                        children: Array.from({
                                            length: totalPages
                                        }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "icon",
                                                variant: page === i + 1 ? "default" : "outline",
                                                className: "rounded-full w-8 h-8 p-0",
                                                onClick: ()=>setPage(i + 1),
                                                children: i + 1
                                            }, i, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-[420px] rounded-xl overflow-hidden mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FactoryMap$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            factories: filtered,
                                            selectedFactoryId: selectedFactoryId,
                                            onSelectFactory: setSelectedFactoryId
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 260,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 259,
                                        columnNumber: 15
                                    }, this),
                                    selectedFactory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-4 items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                src: selectedFactory.image,
                                                alt: selectedFactory.name,
                                                width: 128,
                                                height: 96,
                                                className: "w-32 h-24 object-cover rounded-xl"
                                            }, void 0, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 269,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-2 mb-1 flex-wrap",
                                                        children: [
                                                            selectedFactory.processes?.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `rounded px-2 py-1 text-xs font-bold ${getTagColor(tag)}`,
                                                                    children: tag
                                                                }, tag, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 273,
                                                                    columnNumber: 25
                                                                }, this)),
                                                            selectedFactory.items.slice(0, 2).map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs",
                                                                    children: i
                                                                }, i, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 275,
                                                                    columnNumber: 67
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-bold text-base mb-1",
                                                        children: selectedFactory.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 277,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-gray-500 mb-1 line-clamp-2",
                                                        children: selectedFactory.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-gray-500 mb-1",
                                                        children: [
                                                            "MOQ(최소수량): ",
                                                            selectedFactory.minOrder
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-gray-400",
                                                        children: [
                                                            "주요 품목: ",
                                                            selectedFactory.items.join(", ")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 270,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 257,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 178,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/factories/page.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
} // 주니어 개발자 설명:
 // - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
 // - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
 // - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
 // - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다. 
}}),

};

//# sourceMappingURL=_11499356._.js.map