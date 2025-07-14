(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/supabaseClient.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "supabase": (()=>supabase)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://ulrlltcrqvyutfmhcqyj.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscmxsdGNycXZ5dXRmbWhjcXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzUwODcsImV4cCI6MjA2NjgxMTA4N30.tkkmBX2oOENY0fXHsFY8LGFVTusAjwVVv3NR6UYjjjo");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/factories/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>FactoriesPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function getUnique(arr) {
    return Array.from(new Set(arr));
}
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
    _s();
    const [factories, setFactories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FactoriesPage.useEffect": ()=>{
            async function fetchFactories() {
                setLoading(true);
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("donggori").select("*");
                console.log("공장 데이터:", data, error);
                setFactories(data ?? []);
                setLoading(false);
            }
            fetchFactories();
        }
    }["FactoriesPage.useEffect"], []);
    // 데모 이미지 배열
    const DEMO_IMAGES = [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-[1200px] mx-auto py-16 flex flex-col gap-8",
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-10 text-lg",
                children: "공장 정보를 불러오는 중입니다..."
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 57,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-[40px] font-extrabold text-gray-900 mb-2",
                children: "봉제공장 찾기"
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg text-gray-500",
                children: "퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요."
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
                children: Array.isArray(factories) && factories.length > 0 ? factories.map((f, idx)=>f ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border rounded-xl p-0 bg-white shadow overflow-hidden flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length],
                                    alt: f.company_name ?? '공장 이미지',
                                    className: "object-cover w-full h-full"
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 67,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 66,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 flex-1 flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 mb-2 flex-wrap",
                                        children: Array.isArray(f.processes) && f.processes.map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `rounded px-2 py-1 text-xs font-bold ${getTagColor(tag)}`,
                                                children: tag
                                            }, tag + i, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 78,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 76,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-bold text-base mb-1",
                                        children: f.company_name ?? '이름 없음'
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 81,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 mb-1 line-clamp-2",
                                        children: f.intro ?? '설명 없음'
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 82,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 mb-1",
                                        children: [
                                            "지역: ",
                                            f.admin_district ?? '-'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 mb-1",
                                        children: [
                                            "연락처: ",
                                            f.phone_number ?? '-'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 84,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 mb-1",
                                        children: [
                                            "MOQ(최소 주문 수량): ",
                                            f.moq ?? '-'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 85,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 mb-1",
                                        children: [
                                            "주요 품목: ",
                                            [
                                                f.top_items_upper,
                                                f.top_items_lower,
                                                f.top_items_outer,
                                                f.top_items_dress_skirt
                                            ].filter(Boolean).join(', ')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 86,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-400",
                                        children: [
                                            "위치: 위도 ",
                                            f.lat ?? '-',
                                            ", 경도 ",
                                            f.lng ?? '-'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 87,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 74,
                                columnNumber: 17
                            }, this)
                        ]
                    }, f.id ?? idx, true, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 64,
                        columnNumber: 15
                    }, this) : null) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-20 text-gray-400 text-lg col-span-3",
                    children: "공장 데이터가 없습니다."
                }, void 0, false, {
                    fileName: "[project]/app/factories/page.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/factories/page.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
} // 주니어 개발자 설명:
 // - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
 // - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
 // - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
 // - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다. 
_s(FactoriesPage, "z6yNigrVRFFQ/6l9Ps7mc2YSvTI=");
_c = FactoriesPage;
var _c;
__turbopack_context__.k.register(_c, "FactoriesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_445fe749._.js.map