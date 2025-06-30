(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

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
        kakaoUrl: "https://open.kakao.com/o/some-link1"
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
        kakaoUrl: "https://open.kakao.com/o/some-link2"
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
        kakaoUrl: "https://open.kakao.com/o/some-link3"
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
        kakaoUrl: "https://open.kakao.com/o/some-link4"
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
        kakaoUrl: "https://open.kakao.com/o/some-link5"
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
        kakaoUrl: "https://open.kakao.com/o/some-link6"
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
        kakaoUrl: "https://open.kakao.com/o/some-link7"
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
        kakaoUrl: "https://open.kakao.com/o/some-link8"
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
        kakaoUrl: "https://open.kakao.com/o/some-link9"
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
        kakaoUrl: "https://open.kakao.com/o/some-link10"
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
        kakaoUrl: "https://open.kakao.com/o/some-link11"
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
        kakaoUrl: "https://open.kakao.com/o/some-link12"
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
        kakaoUrl: "https://open.kakao.com/o/some-link13"
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
        kakaoUrl: "https://open.kakao.com/o/some-link14"
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
        kakaoUrl: "https://open.kakao.com/o/some-link15"
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
        kakaoUrl: "https://open.kakao.com/o/some-link16"
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
        kakaoUrl: "https://open.kakao.com/o/some-link17"
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
        kakaoUrl: "https://open.kakao.com/o/some-link18"
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
        kakaoUrl: "https://open.kakao.com/o/some-link19"
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
        kakaoUrl: "https://open.kakao.com/o/some-link20"
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
        kakaoUrl: "https://open.kakao.com/o/some-link21"
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
        kakaoUrl: "https://open.kakao.com/o/some-link22"
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
        kakaoUrl: "https://open.kakao.com/o/some-link23"
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
        kakaoUrl: "https://open.kakao.com/o/some-link24"
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
        kakaoUrl: "https://open.kakao.com/o/some-link25"
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
        kakaoUrl: "https://open.kakao.com/o/some-link26"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/matchRequests.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "matchRequests": (()=>matchRequests)
});
const matchRequests = [
    {
        id: "1",
        designerUserId: "designer1",
        factoryId: "1",
        content: "티셔츠 200장 샘플 및 견적 요청드립니다.",
        status: "대기",
        createdAt: "2024-06-24"
    },
    {
        id: "2",
        designerUserId: "designer2",
        factoryId: "2",
        content: "바지 100장 생산 가능 여부 문의합니다.",
        status: "수락",
        createdAt: "2024-06-24"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/MyPageLayout.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MyPageLayout)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
// 마이페이지 메뉴 항목 배열(경로 명확화)
const menu = [
    {
        label: "문의 내역",
        href: "/my-page/inquiries"
    },
    {
        label: "프로필 수정",
        href: "/my-page/profile"
    }
];
function MyPageLayout({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex w-full max-w-6xl mx-auto min-h-[80vh] pt-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "w-56 pr-8 border-r",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold text-xl mb-8",
                        children: "마이페이지"
                    }, void 0, false, {
                        fileName: "[project]/components/MyPageLayout.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex flex-col gap-2",
                        children: menu.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: `px-3 py-2 rounded text-base font-medium transition-colors ${pathname === item.href ? "bg-toss-blue text-white font-bold" : "text-gray-700 hover:bg-gray-100"}`,
                                children: item.label
                            }, item.href, false, {
                                fileName: "[project]/components/MyPageLayout.tsx",
                                lineNumber: 21,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/MyPageLayout.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyPageLayout.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 pl-8",
                children: children
            }, void 0, false, {
                fileName: "[project]/components/MyPageLayout.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MyPageLayout.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_s(MyPageLayout, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = MyPageLayout;
var _c;
__turbopack_context__.k.register(_c, "MyPageLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/InquiryList.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>InquiryList)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
// 더미 문의 내역 데이터
const inquiries = [
    {
        id: 1,
        factoryName: "동대문 봉제공장 A",
        content: "샘플 제작 단가와 납기 문의드립니다.",
        date: "2024-06-25",
        status: "답변 대기",
        image: "/window.svg"
    },
    {
        id: 2,
        factoryName: "동대문 봉제공장 B",
        content: "대량 생산 가능 여부와 최소 수량이 궁금합니다.",
        date: "2024-06-20",
        status: "답변 완료",
        image: "/file.svg"
    },
    {
        id: 3,
        factoryName: "동대문 봉제공장 C",
        content: "의류 라벨 부착 서비스도 제공하나요?",
        date: "2024-06-15",
        status: "답변 대기",
        image: "/globe.svg"
    }
];
function InquiryList() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-bold",
                    children: "문의 내역"
                }, void 0, false, {
                    fileName: "[project]/components/InquiryList.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/InquiryList.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-6",
                children: inquiries.map((inq)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-white rounded-xl shadow p-6 items-center gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: inq.image,
                                alt: "공장 이미지",
                                className: "w-28 h-28 rounded-lg object-cover bg-gray-100"
                            }, void 0, false, {
                                fileName: "[project]/components/InquiryList.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-lg font-semibold mb-1",
                                        children: inq.factoryName
                                    }, void 0, false, {
                                        fileName: "[project]/components/InquiryList.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-700 mb-2",
                                        children: inq.content
                                    }, void 0, false, {
                                        fileName: "[project]/components/InquiryList.tsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-400",
                                        children: [
                                            "문의일: ",
                                            inq.date
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/InquiryList.tsx",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/InquiryList.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-end gap-2 min-w-[120px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `px-3 py-1 rounded-full text-sm font-bold ${inq.status === "답변 완료" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`,
                                        children: inq.status
                                    }, void 0, false, {
                                        fileName: "[project]/components/InquiryList.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "mt-2 px-4 py-2 bg-toss-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors",
                                        children: "상세보기"
                                    }, void 0, false, {
                                        fileName: "[project]/components/InquiryList.tsx",
                                        lineNumber: 55,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/InquiryList.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this)
                        ]
                    }, inq.id, true, {
                        fileName: "[project]/components/InquiryList.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/InquiryList.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/InquiryList.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = InquiryList;
var _c;
__turbopack_context__.k.register(_c, "InquiryList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/my-page/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MyPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/factories.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$matchRequests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/matchRequests.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyPageLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MyPageLayout.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InquiryList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/InquiryList.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function MyPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const [editMode, setEditMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [factoryName, setFactoryName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [factoryDesc, setFactoryDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editRoleMode, setEditRoleMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const initialRole = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : "";
    const [newRole, setNewRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialRole);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialRole);
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center",
            children: "로그인 후 이용 가능합니다."
        }, void 0, false, {
            fileName: "[project]/app/my-page/page.tsx",
            lineNumber: 21,
            columnNumber: 12
        }, this);
    }
    // 내 매칭 내역
    const myDesignerRequests = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$matchRequests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchRequests"].filter((r)=>r.designerUserId === user.id);
    const myFactoryIds = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["factories"].filter((f)=>f.ownerUserId === user.id).map((f)=>f.id);
    const myFactoryRequests = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$matchRequests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchRequests"].filter((r)=>myFactoryIds.includes(r.factoryId));
    // 내 공장 정보(공장회원만)
    const myFactory = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["factories"].find((f)=>f.ownerUserId === user.id);
    const handleFactoryEdit = (e)=>{
        e.preventDefault();
        // 실제 상태 관리 필요시 구현
        setEditMode(false);
    };
    // 역할 변경 핸들러(실제 서비스라면 Supabase users 테이블 업데이트 필요)
    const handleRoleChange = (e)=>{
        e.preventDefault();
        setRole(newRole);
        setEditRoleMode(false);
    // 실제로는 Supabase users 테이블의 role 필드 업데이트 필요
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyPageLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InquiryList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/app/my-page/page.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/my-page/page.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(MyPage, "CpWlEY7xLG+jsw/EYzdeRHOA3qA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = MyPage;
var _c;
__turbopack_context__.k.register(_c, "MyPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_f2883876._.js.map