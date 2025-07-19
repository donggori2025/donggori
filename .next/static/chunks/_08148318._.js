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
            default: "bg-[#333333] text-white shadow-xs hover:bg-[#333333]/90",
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
const supabaseUrl = ("TURBOPACK compile-time value", "https://ggsmcjwhzgxnlsmsprmb.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc21jandoemd4bmxzbXNwcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNDg3OTksImV4cCI6MjA2NjgyNDc5OX0.SDF62WP4LyiEEe0Ip89JfNQzVW0UR19OT75Dcadf3fs");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// factories 데이터에서 옵션 추출 유틸(공장 찾기에서 복사)
const moqRanges = [
    {
        label: "0-50",
        min: 0,
        max: 50
    },
    {
        label: "51-100",
        min: 51,
        max: 100
    },
    {
        label: "101-300",
        min: 101,
        max: 300
    },
    {
        label: "301+",
        min: 301,
        max: Infinity
    }
];
// 채팅 말풍선 컴포넌트 (fade-in + 타이핑 효과)
function ChatBubble({ text, type, isTyping, showCursor, onEdit }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex flex-col items-${type === "answer" ? "end" : "start"} w-full`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative px-4 py-2 rounded-2xl text-base animate-fade-in max-w-[80%] ${type === "question" ? "bg-white text-black self-start" : "bg-[#222222] text-white self-end"}`,
                style: {
                    minHeight: 40
                },
                children: isTyping ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        text,
                        showCursor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-block w-2 animate-blink ml-0.5",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 25,
                            columnNumber: 28
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 23,
                    columnNumber: 11
                }, this) : text
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            type === "answer" && onEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "mt-1 text-xs text-gray-400 underline hover:text-[#222222]",
                onClick: onEdit,
                children: "수정"
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/matching/page.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = ChatBubble;
function MatchingPage() {
    _s();
    // 공장 데이터 state
    const [factories, setFactories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            async function fetchFactories() {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("donggori").select("*");
                setFactories(data ?? []);
            }
            fetchFactories();
        }
    }["MatchingPage.useEffect"], []);
    // factories state 기반 옵션 추출 함수 (함수 내부에서 선언)
    const getOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MatchingPage.useCallback[getOptions]": (key)=>{
            if (key === 'admin_district') {
                return Array.from(new Set(factories.map({
                    "MatchingPage.useCallback[getOptions]": (f)=>f.admin_district
                }["MatchingPage.useCallback[getOptions]"]).filter({
                    "MatchingPage.useCallback[getOptions]": (v)=>typeof v === 'string' && Boolean(v)
                }["MatchingPage.useCallback[getOptions]"])));
            }
            if (key === 'processes') {
                return Array.from(new Set(factories.flatMap({
                    "MatchingPage.useCallback[getOptions]": (f)=>f.processes ? String(f.processes).split(',').map({
                            "MatchingPage.useCallback[getOptions]": (v)=>v.trim()
                        }["MatchingPage.useCallback[getOptions]"]) : []
                }["MatchingPage.useCallback[getOptions]"]).filter({
                    "MatchingPage.useCallback[getOptions]": (v)=>typeof v === 'string' && Boolean(v)
                }["MatchingPage.useCallback[getOptions]"])));
            }
            if (key === 'sewing_machines' || key === 'pattern_machines' || key === 'special_machines') {
                return Array.from(new Set(factories.flatMap({
                    "MatchingPage.useCallback[getOptions]": (f)=>f[key] ? String(f[key]).split(',').map({
                            "MatchingPage.useCallback[getOptions]": (v)=>v.trim()
                        }["MatchingPage.useCallback[getOptions]"]) : []
                }["MatchingPage.useCallback[getOptions]"]).filter({
                    "MatchingPage.useCallback[getOptions]": (v)=>typeof v === 'string' && Boolean(v)
                }["MatchingPage.useCallback[getOptions]"])));
            }
            if (key === 'items') {
                const arr = factories.flatMap({
                    "MatchingPage.useCallback[getOptions].arr": (f)=>[
                            f.top_items_upper,
                            f.top_items_lower,
                            f.top_items_outer,
                            f.top_items_dress_skirt,
                            f.top_items_bag,
                            f.top_items_fashion_accessory,
                            f.top_items_underwear,
                            f.top_items_sports_leisure,
                            f.top_items_pet
                        ].filter({
                            "MatchingPage.useCallback[getOptions].arr": (v)=>typeof v === 'string' && Boolean(v)
                        }["MatchingPage.useCallback[getOptions].arr"])
                }["MatchingPage.useCallback[getOptions].arr"]);
                return Array.from(new Set(arr.flatMap({
                    "MatchingPage.useCallback[getOptions]": (i)=>String(i).split(',').map({
                            "MatchingPage.useCallback[getOptions]": (v)=>v.trim()
                        }["MatchingPage.useCallback[getOptions]"])
                }["MatchingPage.useCallback[getOptions]"]).filter({
                    "MatchingPage.useCallback[getOptions]": (v)=>typeof v === 'string' && Boolean(v)
                }["MatchingPage.useCallback[getOptions]"])));
            }
            return [];
        }
    }["MatchingPage.useCallback[getOptions]"], [
        factories
    ]);
    // 동적 질문/옵션 useMemo는 반드시 함수 내부에서 호출
    const QUESTIONS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MatchingPage.useMemo[QUESTIONS]": ()=>[
                {
                    question: "어떤 공정을 원하시나요?",
                    key: "processes",
                    options: getOptions("processes")
                },
                {
                    question: "지역을 선택하세요",
                    key: "admin_district",
                    options: getOptions("admin_district")
                },
                {
                    question: "MOQ(최소 주문 수량)을 선택하세요",
                    key: "moq",
                    options: moqRanges.map({
                        "MatchingPage.useMemo[QUESTIONS]": (r)=>r.label
                    }["MatchingPage.useMemo[QUESTIONS]"])
                },
                {
                    question: "재봉기를 선택하세요",
                    key: "sewing_machines",
                    options: getOptions("sewing_machines")
                },
                {
                    question: "패턴기를 선택하세요",
                    key: "pattern_machines",
                    options: getOptions("pattern_machines")
                },
                {
                    question: "특수기를 선택하세요",
                    key: "special_machines",
                    options: getOptions("special_machines")
                },
                {
                    question: "어떤 품목을 원하시나요?",
                    key: "items",
                    options: getOptions("items")
                }
            ]
    }["MatchingPage.useMemo[QUESTIONS]"], [
        getOptions
    ]);
    // 채팅 메시지(질문/답변 순서대로)
    const [chat, setChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [introDone, setIntroDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // 인트로 타이핑 상태 추가
    const [typingText, setTypingText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""); // 현재 타이핑 중인 텍스트
    // introMessages를 useMemo로 관리
    const introMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MatchingPage.useMemo[introMessages]": ()=>[
                "반갑습니다:)",
                "동고리가 봉제공장을 추천해드릴게요!",
                QUESTIONS[0]?.question || "어떤 공정을 원하시나요?"
            ]
    }["MatchingPage.useMemo[introMessages]"], [
        QUESTIONS
    ]);
    const [introStep, setIntroStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0); // 0: 타이핑, 1: ... 표시, 2: 다음 메시지
    const typingTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            // 인트로 타이핑 효과
            setChat([]);
            setIntroDone(false);
            setTypingText("");
            setIntroStep(0);
            const timers = [];
            let currentMsgIdx = 0;
            let currentCharIdx = 0;
            function typeNextChar() {
                const msg = introMessages[currentMsgIdx];
                if (currentCharIdx < msg.length) {
                    setTypingText(msg.slice(0, currentCharIdx + 1));
                    currentCharIdx++;
                    typingTimer.current = setTimeout(typeNextChar, 40); // 타이핑 속도
                } else {
                    // 타이핑 끝나면 바로 메시지 추가 및 다음 메시지로 이동
                    setChat({
                        "MatchingPage.useEffect.typeNextChar": (prev)=>[
                                ...prev,
                                {
                                    type: "question",
                                    text: msg
                                }
                            ]
                    }["MatchingPage.useEffect.typeNextChar"]);
                    setTypingText("");
                    setIntroStep(2);
                    if (currentMsgIdx < introMessages.length - 1) {
                        currentMsgIdx++;
                        currentCharIdx = 0;
                        setTimeout({
                            "MatchingPage.useEffect.typeNextChar": ()=>{
                                setIntroStep(0);
                                typeNextChar();
                            }
                        }["MatchingPage.useEffect.typeNextChar"], 200); // 바로 다음 메시지 타이핑 시작, 약간의 텀만 둠
                    } else {
                        // 인트로 끝: setTimeout 없이 바로 introDone 처리
                        setIntroDone(true);
                    }
                }
            }
            // 첫 메시지 타이핑 시작
            typeNextChar();
            return ({
                "MatchingPage.useEffect": ()=>{
                    timers.forEach(clearTimeout);
                    if (typingTimer.current) clearTimeout(typingTimer.current);
                }
            })["MatchingPage.useEffect"];
        }
    }["MatchingPage.useEffect"], [
        introMessages
    ]);
    // 현재 질문 인덱스
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // 사용자가 선택한 답변들
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedOptions, setSelectedOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // user 변수 제거 (사용하지 않음)
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [showLoginModal, setShowLoginModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recommended, setRecommended] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // 추천 결과 로딩 상태 추가
    const [resultLoading, setResultLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // 채팅 스크롤 ref
    const chatScrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // 데모 이미지 배열(공장 찾기와 동일)
    const DEMO_IMAGES = [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
    ];
    // 카드별 칩(공장 id 기준) - 공장 찾기와 동일하게 고정
    const cardFabricsById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MatchingPage.useMemo[cardFabricsById]": ()=>{
            const fabricChips = [
                {
                    label: '봉제',
                    color: '#0ACF83',
                    bg: 'rgba(10, 207, 131, 0.1)'
                },
                {
                    label: '샘플',
                    color: '#08B7FF',
                    bg: 'rgba(8, 183, 255, 0.1)'
                },
                {
                    label: '패턴',
                    color: '#FF8308',
                    bg: 'rgba(255, 131, 8, 0.1)'
                },
                {
                    label: '나염',
                    color: '#A259FF',
                    bg: 'rgba(162, 89, 255, 0.1)'
                },
                {
                    label: '전사',
                    color: '#ED6262',
                    bg: 'rgba(237, 98, 98, 0.1)'
                }
            ];
            return Object.fromEntries(recommended.map({
                "MatchingPage.useMemo[cardFabricsById]": (f, idx)=>{
                    const seed = String(f.id ?? idx);
                    let hash = 0;
                    for(let i = 0; i < seed.length; i++)hash = (hash << 5) - hash + seed.charCodeAt(i);
                    const shuffled = [
                        ...fabricChips
                    ].sort({
                        "MatchingPage.useMemo[cardFabricsById].shuffled": (a, b)=>{
                            const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
                            const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
                            return h1 - h2;
                        }
                    }["MatchingPage.useMemo[cardFabricsById].shuffled"]);
                    const count = Math.abs(hash) % 2 + 1;
                    return [
                        f.id ?? idx,
                        shuffled.slice(0, count)
                    ];
                }
            }["MatchingPage.useMemo[cardFabricsById]"]));
        }
    }["MatchingPage.useMemo[cardFabricsById]"], [
        recommended
    ]);
    // 선택지 클릭 시
    const handleOptionToggle = (option)=>{
        setSelectedOptions((prev)=>prev.includes(option) ? prev.filter((o)=>o !== option) : [
                ...prev,
                option
            ]);
    };
    // 1. showResult, loading 등 결과 오버레이/전체화면 관련 상태/코드 제거
    // 2. handleConfirm, handleSkip에서 setShowResult, setLoading 등 제거, 대신 answers가 7개(마지막)까지 쌓이면 결과 상태로 전환
    // 3. 왼쪽: 7개 답변이 모두 끝나면 질문/선택지 대신 추천 3개 카드만 표시
    // 4. 오른쪽: 기존 채팅 UI 아래에 결과 안내 메시지(답변 말풍선) 추가
    // handleConfirm 내부
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
            // 7개 완료 시 추천 결과만 상태에 저장
            const rec = getRecommendedFactories(newAnswers.map((a)=>a.join(", ")));
            setRecommended(rec);
        // step, answers 등은 그대로 두고, showResult/로딩 등은 사용하지 않음
        }
    };
    // handleSkip도 동일하게 showResult/로딩 제거
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
            const rec = getRecommendedFactories(newAnswers.map((a)=>a.join(", ")));
            setRecommended(rec);
        }
    };
    // 추천 알고리즘: 답변과 공장 데이터 매칭 점수 계산
    const getRecommendedFactories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MatchingPage.useCallback[getRecommendedFactories]": (answers)=>{
            // 선택한 옵션 중 1개라도 일치하는 공장만 후보로 삼고, 그 중 최대 3개만(랜덤 또는 상위 3개) 노출
            // 일치하는 공장이 3개 미만이면 나머지는 랜덤으로 채움
            const matched = factories.filter({
                "MatchingPage.useCallback[getRecommendedFactories].matched": (f)=>{
                    // 공정
                    if (answers[0] && Array.isArray(f.processes) && f.processes.some({
                        "MatchingPage.useCallback[getRecommendedFactories].matched": (p)=>answers[0].includes(p)
                    }["MatchingPage.useCallback[getRecommendedFactories].matched"])) return true;
                    // 지역
                    if (answers[1] && typeof f.admin_district === 'string' && answers[1].includes(f.admin_district)) return true;
                    // MOQ(수량)
                    if (answers[2]) {
                        if (answers[2] === "0-50" && f.minOrder <= 50 || answers[2] === "51-100" && f.minOrder <= 100 || answers[2] === "101-300" && f.minOrder <= 300 || answers[2] === "301+" && f.minOrder > 300) return true;
                    }
                    // 재봉기/패턴기/특수기
                    if (answers[3] && typeof f.sewing_machines === 'string' && answers[3].split(',').some({
                        "MatchingPage.useCallback[getRecommendedFactories].matched": (val)=>typeof f.sewing_machines === 'string' && f.sewing_machines.includes(val)
                    }["MatchingPage.useCallback[getRecommendedFactories].matched"])) return true;
                    if (answers[4] && typeof f.pattern_machines === 'string' && answers[4].split(',').some({
                        "MatchingPage.useCallback[getRecommendedFactories].matched": (val)=>typeof f.pattern_machines === 'string' && f.pattern_machines.includes(val)
                    }["MatchingPage.useCallback[getRecommendedFactories].matched"])) return true;
                    if (answers[5] && typeof f.special_machines === 'string' && answers[5].split(',').some({
                        "MatchingPage.useCallback[getRecommendedFactories].matched": (val)=>typeof f.special_machines === 'string' && f.special_machines.includes(val)
                    }["MatchingPage.useCallback[getRecommendedFactories].matched"])) return true;
                    // 품목
                    if (answers[6] && Array.isArray(f.items) && f.items.some({
                        "MatchingPage.useCallback[getRecommendedFactories].matched": (i)=>answers[6].includes(i)
                    }["MatchingPage.useCallback[getRecommendedFactories].matched"])) return true;
                    return false;
                }
            }["MatchingPage.useCallback[getRecommendedFactories].matched"]);
            // 3개 미만이면 랜덤으로 채움
            const result = matched.slice(0, 3).map({
                "MatchingPage.useCallback[getRecommendedFactories].result": (f)=>({
                        ...f,
                        score: 1
                    })
            }["MatchingPage.useCallback[getRecommendedFactories].result"]);
            if (result.length < 3) {
                const others = factories.filter({
                    "MatchingPage.useCallback[getRecommendedFactories].others": (f)=>!matched.includes(f)
                }["MatchingPage.useCallback[getRecommendedFactories].others"]);
                while(result.length < 3 && others.length > 0){
                    const idx = Math.floor(Math.random() * others.length);
                    result.push({
                        ...others.splice(idx, 1)[0],
                        score: 1
                    });
                }
            }
            return result;
        }
    }["MatchingPage.useCallback[getRecommendedFactories]"], [
        factories
    ]);
    // 추천 결과 카드 UI (공장 정보 상세)
    function renderResultCards() {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex flex-col items-center justify-center min-h-[500px] animate-fade-in",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-[40px] font-extrabold text-gray-900 mb-2",
                    children: "가장 적합한 봉제공장 3곳을 추천드려요!"
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 296,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-3xl",
                    children: recommended.map((f, idx)=>{
                        const displayName = typeof f.name === 'string' && f.name ? f.name : typeof f.company_name === 'string' && f.company_name ? f.company_name : '이름 없음';
                        const mainItems = [
                            f.top_items_upper,
                            f.top_items_lower,
                            f.top_items_outer,
                            f.top_items_dress_skirt
                        ].filter((v)=>typeof v === 'string' && v.length > 0).join(', ') || '-';
                        const randomFabrics = cardFabricsById[f.id ?? idx] || [];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-xl bg-white overflow-hidden flex flex-col border border-gray-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length],
                                        alt: typeof f.company_name === 'string' ? f.company_name : '공장 이미지',
                                        className: "object-cover w-full h-full rounded-xl",
                                        width: 400,
                                        height: 160,
                                        priority: idx < 3
                                    }, void 0, false, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 312,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 311,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 322,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 flex flex-col p-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 mb-2",
                                            children: randomFabrics.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: chip.color,
                                                        background: chip.bg
                                                    },
                                                    className: "rounded-full px-3 py-1 text-xs font-semibold",
                                                    children: chip.label
                                                }, chip.label, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 326,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-bold text-base mb-1",
                                            children: displayName
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 333,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-bold mt-2 mb-1 flex items-center",
                                            style: {
                                                color: '#333333',
                                                opacity: 0.6
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "shrink-0",
                                                    children: "주요품목"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-normal ml-2 flex-1 truncate",
                                                    children: mainItems
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 335,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-bold",
                                            style: {
                                                color: '#333333',
                                                opacity: 0.6
                                            },
                                            children: [
                                                "MOQ(최소 주문 수량) ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-normal",
                                                    children: typeof f.moq === 'number' ? f.moq : typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? Number(f.moq) : typeof f.minOrder === 'number' ? f.minOrder : '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 35
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full mt-4 bg-[#333333] text-white rounded-lg py-2 font-semibold hover:bg-[#222] transition",
                                            onClick: ()=>router.push(`/factories/${f.id}`),
                                            children: "의뢰하기"
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 342,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 324,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, f.id ?? idx, true, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 309,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/matching/page.tsx",
            lineNumber: 295,
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
                    lineNumber: 361,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-lg font-semibold",
                    children: "추천 결과를 분석 중입니다..."
                }, void 0, false, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 362,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/matching/page.tsx",
            lineNumber: 360,
            columnNumber: 7
        }, this);
    }
    // 이전 단계로 돌아가기 (수정)
    const handleEdit = (editStep)=>{
        setLoading(false);
        setStep(editStep);
        setSelectedOptions(answers[editStep] || []);
        setAnswers(answers.slice(0, editStep));
        setChat(chat.slice(0, 1 + editStep * 2)); // 질문/답변 쌍이므로
    };
    // 추천 결과(매칭 완료) 시 왼쪽 하단에 '직접 찾기'와 '다시하기' 버튼을 추가합니다. '직접 찾기'는 /factories로 이동, '다시하기'는 매칭 상태(answers, step, chat 등) 초기화. 버튼은 Figma 예시처럼 스타일링(직접 찾기: 흰색, 다시하기: 검정 배경, 아이콘 포함)합니다.
    const handleRestart = ()=>{
        setLoading(false);
        setStep(0);
        setAnswers([]);
        setSelectedOptions([]);
        setChat([]);
        setIntroDone(false);
        setRecommended([]); // 결과 초기화
    };
    // 답변이 모두 끝나면 분석 로딩 후 결과 노출
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            if (answers.length === QUESTIONS.length) {
                setResultLoading(true);
                const timer = setTimeout({
                    "MatchingPage.useEffect.timer": ()=>{
                        const rec = getRecommendedFactories(answers.map({
                            "MatchingPage.useEffect.timer.rec": (a)=>a.join(", ")
                        }["MatchingPage.useEffect.timer.rec"]));
                        setRecommended(rec);
                        setResultLoading(false);
                    }
                }["MatchingPage.useEffect.timer"], 2200); // 2.2초 분석 로딩
                return ({
                    "MatchingPage.useEffect": ()=>clearTimeout(timer)
                })["MatchingPage.useEffect"];
            } else {
                setResultLoading(false);
            }
        }
    }["MatchingPage.useEffect"], [
        answers.length,
        QUESTIONS.length,
        getRecommendedFactories,
        answers
    ]);
    // 채팅 자동 스크롤 useEffect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
        }
    }["MatchingPage.useEffect"], [
        chat,
        recommended,
        resultLoading
    ]);
    // --- [추가: 결과 안내 메시지 상태] ---
    const [showResultMsg1, setShowResultMsg1] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showResultMsg2, setShowResultMsg2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- [결과 안내 메시지 타이밍 제어 useEffect 수정] ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            if (answers.length === QUESTIONS.length && recommended.length > 0 && !resultLoading) {
                setShowResultMsg1(false);
                setShowResultMsg2(false);
                const t1 = setTimeout({
                    "MatchingPage.useEffect.t1": ()=>setShowResultMsg1(true)
                }["MatchingPage.useEffect.t1"], 500); // 0.5초 후 첫 메시지
                const t2 = setTimeout({
                    "MatchingPage.useEffect.t2": ()=>setShowResultMsg2(true)
                }["MatchingPage.useEffect.t2"], 1500); // 1.5초 후 두 번째 메시지
                return ({
                    "MatchingPage.useEffect": ()=>{
                        clearTimeout(t1);
                        clearTimeout(t2);
                    }
                })["MatchingPage.useEffect"];
            } else {
                setShowResultMsg1(false);
                setShowResultMsg2(false);
            }
        }
    }["MatchingPage.useEffect"], [
        answers.length,
        recommended,
        resultLoading,
        QUESTIONS.length
    ]);
    // 결과 안내 메시지 등장 시 채팅창 자동 스크롤
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchingPage.useEffect": ()=>{
            if ((showResultMsg1 || showResultMsg2) && chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
        }
    }["MatchingPage.useEffect"], [
        showResultMsg1,
        showResultMsg2
    ]);
    // 왼쪽: 질문/선택지 or 결과 카드 or 로딩
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-96bbb84b947b176d" + " " + "w-full min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-start overflow-x-hidden py-16 px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    minHeight: '84vh'
                },
                className: "jsx-96bbb84b947b176d" + " " + "w-full max-w-[1400px] mx-auto flex flex-row gap-4 items-start justify-center flex-1 transition-opacity duration-700 px-1 overflow-hidden bg-[#F4F5F7] pb-0 mb-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-96bbb84b947b176d" + " " + "flex-[2] bg-white rounded-2xl shadow border p-6 flex flex-col h-[100vh] max-h-[80vh]",
                        children: answers.length === QUESTIONS.length ? resultLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-96bbb84b947b176d" + " " + "flex flex-1 flex-col items-center justify-center min-h-[400px] animate-fade-in",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "w-16 h-16 border-4 border-gray-300 border-t-[#222222] rounded-full animate-spin mb-6"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 450,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "text-lg font-semibold",
                                    children: "추천 결과를 분석 중입니다..."
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 449,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-96bbb84b947b176d" + " " + "flex flex-col flex-1 justify-between h-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "flex-1 flex flex-col items-center justify-center",
                                    children: renderResultCards()
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 455,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "flex w-full gap-4 pt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push('/factories'),
                                            className: "jsx-96bbb84b947b176d" + " " + "flex-1 flex items-center justify-center border border-gray-300 rounded-lg py-3 text-base font-semibold bg-white hover:bg-gray-50 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-96bbb84b947b176d" + " " + "mr-2",
                                                    children: "🔍"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 464,
                                                    columnNumber: 21
                                                }, this),
                                                "직접 찾기"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 460,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleRestart,
                                            className: "jsx-96bbb84b947b176d" + " " + "flex-1 flex items-center justify-center rounded-lg py-3 text-base font-semibold bg-[#222] text-white hover:bg-[#111] transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-96bbb84b947b176d" + " " + "mr-2",
                                                    children: "↻"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 470,
                                                    columnNumber: 21
                                                }, this),
                                                "다시하기"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 466,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 459,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 454,
                            columnNumber: 15
                        }, this) : !introDone ? // 인트로 타이핑 중에는 아무것도 안 보이게(또는 로딩/스켈레톤 등)
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-96bbb84b947b176d" + " " + "flex-1 flex items-center justify-center text-gray-400 text-lg",
                            children: "..."
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 477,
                            columnNumber: 13
                        }, this) : // 기존 질문/선택지 UI
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "flex-1 min-h-0 flex flex-col gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "text-base text-gray-500 mb-4",
                                            children: [
                                                "몇 가지 정보를 알려주시면,",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-96bbb84b947b176d"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 484,
                                                    columnNumber: 34
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-96bbb84b947b176d" + " " + "font-bold",
                                                    children: "가장 적합한 3개의 봉제공장을 추천"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 485,
                                                    columnNumber: 19
                                                }, this),
                                                "해드립니다."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 483,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                            className: "jsx-96bbb84b947b176d" + " " + "my-4 border-gray-200"
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 487,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "flex gap-2 mb-6",
                                            children: QUESTIONS.map((_, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-96bbb84b947b176d" + " " + `h-1 w-12 rounded-full ${idx <= step ? "bg-[#333333]" : "bg-gray-200"}`
                                                }, idx, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 490,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 488,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "text-sm text-gray-400 mb-2",
                                            children: [
                                                step + 1,
                                                " of ",
                                                QUESTIONS.length
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 493,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "text-xl font-bold mb-6",
                                            children: QUESTIONS[step].question
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 494,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: QUESTIONS[step].key === 'items' ? {
                                                maxHeight: 'unset'
                                            } : {},
                                            className: "jsx-96bbb84b947b176d" + " " + ((QUESTIONS[step].key === 'items' ? 'bg-gray-50 rounded-xl p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1' : 'bg-gray-50 rounded-xl p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1') || ""),
                                            children: QUESTIONS[step].options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>handleOptionToggle(option),
                                                    className: "jsx-96bbb84b947b176d" + " " + `rounded-xl bg-white shadow text-[15px] font-medium py-8 transition border border-gray-200 flex items-center justify-center
                        ${selectedOptions.includes(option) ? "border-[#333333] ring-2 ring-[#333333]" : "hover:border-[#333333]"}
                      `,
                                                    children: option
                                                }, option, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 496,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "h-6"
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 513,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 482,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + "pt-4 pb-6 border-t border-gray-200 flex justify-between items-center gap-4 shrink-0 bg-white",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push("/"),
                                            className: "jsx-96bbb84b947b176d" + " " + "text-base text-gray-500 underline",
                                            children: "나가기"
                                        }, void 0, false, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 517,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-96bbb84b947b176d" + " " + "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    className: "text-[#333333] text-base px-6 py-3",
                                                    onClick: handleSkip,
                                                    children: "건너뛰기"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 519,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    className: "bg-[#333333] text-white rounded-lg px-8 py-3 font-bold text-base",
                                                    onClick: handleConfirm,
                                                    disabled: selectedOptions.length === 0,
                                                    children: "다음"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/matching/page.tsx",
                                                    lineNumber: 520,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/matching/page.tsx",
                                            lineNumber: 518,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 516,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/matching/page.tsx",
                        lineNumber: 446,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: '80vh',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        },
                        ref: chatScrollRef,
                        className: "jsx-96bbb84b947b176d" + " " + "flex-[1] bg-[#F7F8FA] rounded-xl shadow-md p-4 min-h-[500px] flex flex-col gap-6",
                        children: [
                            chat.map((msg, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-96bbb84b947b176d" + " " + `flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatBubble, {
                                        text: msg.text,
                                        type: msg.type,
                                        onEdit: msg.type === "answer" && introDone ? ()=>handleEdit(Math.floor((idx - introMessages.length) / 2)) : undefined
                                    }, void 0, false, {
                                        fileName: "[project]/app/matching/page.tsx",
                                        lineNumber: 541,
                                        columnNumber: 15
                                    }, this)
                                }, idx, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 540,
                                    columnNumber: 13
                                }, this)),
                            !introDone && typingText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-96bbb84b947b176d" + " " + "flex justify-start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatBubble, {
                                    text: typingText,
                                    type: "question",
                                    isTyping: true,
                                    showCursor: introStep === 0
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 551,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 550,
                                columnNumber: 13
                            }, this),
                            showResultMsg1 && recommended.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-96bbb84b947b176d" + " " + "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatBubble, {
                                    text: `가장 적합한 봉제공장은\n${recommended.map((f)=>typeof f.name === 'string' && f.name ? f.name : typeof f.company_name === 'string' && f.company_name ? f.company_name : '이름 없음').join(', ')} 입니다!`,
                                    type: "answer"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 557,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 556,
                                columnNumber: 13
                            }, this),
                            showResultMsg2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-96bbb84b947b176d" + " " + "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatBubble, {
                                    text: `봉제를 진행할 공장을 선택하여\n공정을 시작해보세요:)`,
                                    type: "answer"
                                }, void 0, false, {
                                    fileName: "[project]/app/matching/page.tsx",
                                    lineNumber: 565,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/matching/page.tsx",
                                lineNumber: 564,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/matching/page.tsx",
                        lineNumber: 533,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 444,
                columnNumber: 7
            }, this),
            showLoginModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-96bbb84b947b176d" + " " + "fixed inset-0 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-96bbb84b947b176d" + " " + "bg-white rounded-xl shadow-lg p-8 max-w-xs w-full text-center border border-gray-200",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-96bbb84b947b176d" + " " + "text-lg font-bold mb-2",
                            children: "로그인 후 이용 가능합니다"
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 577,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-96bbb84b947b176d" + " " + "text-gray-500 mb-4",
                            children: "의뢰하기는 로그인 후 이용하실 수 있습니다."
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 578,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            className: "w-full mb-2",
                            onClick: ()=>router.push("/sign-in"),
                            children: "로그인 화면으로 이동"
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 579,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            className: "w-full",
                            onClick: ()=>setShowLoginModal(false),
                            children: "닫기"
                        }, void 0, false, {
                            fileName: "[project]/app/matching/page.tsx",
                            lineNumber: 580,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/matching/page.tsx",
                    lineNumber: 576,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 575,
                columnNumber: 9
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-96bbb84b947b176d" + " " + "absolute inset-0 flex items-center justify-center bg-gray-50 z-50 transition-opacity duration-700 animate-fade-in",
                children: renderLoading()
            }, void 0, false, {
                fileName: "[project]/app/matching/page.tsx",
                lineNumber: 586,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "96bbb84b947b176d",
                children: "@keyframes fade-in{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.animate-fade-in{animation:.5s cubic-bezier(.4,0,.2,1) fade-in}@keyframes blink{0%,to{opacity:1}50%{opacity:0}}.animate-blink{animation:1s step-end infinite blink}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/matching/page.tsx",
        lineNumber: 443,
        columnNumber: 5
    }, this);
}
_s(MatchingPage, "iTeTFeyTT76AexAC6QbbT/Y2shk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = MatchingPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChatBubble");
__turbopack_context__.k.register(_c1, "MatchingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_08148318._.js.map