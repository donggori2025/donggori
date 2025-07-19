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
const supabaseUrl = ("TURBOPACK compile-time value", "https://ggsmcjwhzgxnlsmsprmb.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc21jandoemd4bmxzbXNwcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNDg3OTksImV4cCI6MjA2NjgyNDc5OX0.SDF62WP4LyiEEe0Ip89JfNQzVW0UR19OT75Dcadf3fs");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ArrowPathIcon.js [app-client] (ecmascript) <export default as ArrowPathIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ChevronDownIcon.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function FactoriesPage() {
    _s();
    const [factories, setFactories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // 검색 상태
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // 필터 상태 (여러 개 선택 가능하도록 배열로 변경)
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        admin_district: [],
        moq: [],
        monthly_capacity: [],
        business_type: [],
        distribution: [],
        delivery: [],
        items: [],
        equipment: [],
        sewing_machines: [],
        pattern_machines: [],
        special_machines: [],
        factory_type: [],
        main_fabrics: [],
        processes: []
    });
    // Range 옵션
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
    const monthlyCapacityRanges = [
        {
            label: "0-100",
            min: 0,
            max: 100
        },
        {
            label: "101-300",
            min: 101,
            max: 300
        },
        {
            label: "301-500",
            min: 301,
            max: 500
        },
        {
            label: "501+",
            min: 501,
            max: Infinity
        }
    ];
    // 목록/지도 뷰 상태
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('list');
    // 옵션 동적 추출 함수 (중복 없는 값, 분리 처리)
    function getOptions(key) {
        if (key === 'business_type' || key === 'distribution' || key === 'delivery') {
            const values = factories.flatMap((f)=>f[key] ? String(f[key]).split(',').map((v)=>v.trim()) : []);
            return Array.from(new Set(values.filter((v)=>typeof v === 'string' && Boolean(v))));
        }
        if (key === 'equipment') {
            // |로 카테고리 분리, :로 카테고리명/값 분리, 쉼표로 하위 항목 분리
            const all = factories.flatMap((f)=>f.equipment ? String(f.equipment).split('|').map((v)=>v.trim()) : []);
            const byCategory = {};
            all.forEach((str)=>{
                const [cat, vals] = str.split(':').map((s)=>s.trim());
                if (cat && vals) {
                    byCategory[cat] = [
                        ...byCategory[cat] || [],
                        ...vals.split(',').map((v)=>v.trim())
                    ];
                }
            });
            // 중복 제거
            Object.keys(byCategory).forEach((cat)=>{
                byCategory[cat] = Array.from(new Set(byCategory[cat].filter(Boolean)));
            });
            // equipment는 실제로 string[]로 반환하지 않으므로 빈 배열 반환
            return [];
        }
        if (key === 'sewing_machines' || key === 'pattern_machines' || key === 'special_machines') {
            const values = factories.flatMap((f)=>f[key] ? String(f[key]).split(',').map((v)=>v.trim()) : []);
            return Array.from(new Set(values.filter((v)=>typeof v === 'string' && Boolean(v))));
        }
        if (key === 'items') {
            const arr = factories.flatMap((f)=>[
                    f.top_items_upper,
                    f.top_items_lower,
                    f.top_items_outer,
                    f.top_items_dress_skirt,
                    f.top_items_bag,
                    f.top_items_fashion_accessory,
                    f.top_items_underwear,
                    f.top_items_sports_leisure,
                    f.top_items_pet
                ].filter((v)=>typeof v === 'string' && Boolean(v)));
            const commaSplit = arr.flatMap((i)=>String(i).split(',').map((v)=>v.trim()));
            return Array.from(new Set(commaSplit.filter((v)=>typeof v === 'string' && Boolean(v))));
        }
        if (key === 'processes') {
            const values = factories.flatMap((f)=>f.processes ? String(f.processes).split(',').map((v)=>v.trim()) : []);
            return Array.from(new Set(values.filter((v)=>typeof v === 'string' && Boolean(v))));
        }
        if (key === 'main_fabrics') {
            const values = factories.flatMap((f)=>f.main_fabrics ? String(f.main_fabrics).split(',').map((v)=>v.trim()) : []);
            return Array.from(new Set(values.filter((v)=>typeof v === 'string' && Boolean(v))));
        }
        const values = factories.map((f)=>f[key]);
        // 항상 배열 반환 보장
        if (Array.isArray(values)) {
            return Array.from(new Set(values.flatMap((v)=>typeof v === 'string' ? [
                    v
                ] : [])));
        }
        return [];
    }
    // 필터링 로직 (여러 값 중 하나라도 포함되면 통과, range/검색 포함)
    const filtered = factories.filter((f)=>{
        const itemList = [
            f.top_items_upper,
            f.top_items_lower,
            f.top_items_outer,
            f.top_items_dress_skirt,
            f.top_items_bag,
            f.top_items_fashion_accessory,
            f.top_items_underwear,
            f.top_items_sports_leisure,
            f.top_items_pet
        ];
        // 검색어 필터
        const searchMatch = !search || typeof f.company_name === 'string' && f.company_name.includes(search) || typeof f.intro === 'string' && f.intro.includes(search) || itemList.some((i)=>typeof i === 'string' && i && i.includes(search));
        // MOQ/월생산량 range 필터
        const moqValue = typeof f.moq === 'number' ? f.moq : typeof f.moq === 'string' ? Number(f.moq) : undefined;
        const moqMatch = selected.moq.length === 0 || selected.moq.some((rangeLabel)=>{
            const range = moqRanges.find((r)=>r.label === rangeLabel);
            return range && typeof moqValue === 'number' && moqValue >= range.min && moqValue <= range.max;
        });
        const monthlyCapacityMatch = selected.monthly_capacity.length === 0 || selected.monthly_capacity.some((rangeLabel)=>{
            const range = monthlyCapacityRanges.find((r)=>r.label === rangeLabel);
            return range && typeof f.monthly_capacity === 'number' && f.monthly_capacity >= range.min && f.monthly_capacity <= range.max;
        });
        // business_type, distribution, delivery, equipment 분리 필터
        const businessTypeArr = f.business_type ? String(f.business_type).split(',').map((v)=>v.trim()) : [];
        const distributionArr = f.distribution ? String(f.distribution).split(',').map((v)=>v.trim()).filter((v)=>typeof v === 'string') : [];
        const deliveryArr = f.delivery ? String(f.delivery).split(',').map((v)=>v.trim()).filter((v)=>typeof v === 'string') : [];
        const equipmentArr = f.equipment ? String(f.equipment).split('|').map((v)=>v.trim()).filter((v)=>typeof v === 'string') : [];
        // 재봉기/패턴기/특수기 필터: 쉼표 분리 후 일부라도 포함되면 통과
        const sewingArr = typeof f.sewing_machines === 'string' ? f.sewing_machines.split(',').map((s)=>s.trim()) : [];
        const patternArr = typeof f.pattern_machines === 'string' ? f.pattern_machines.split(',').map((s)=>s.trim()) : [];
        const specialArr = typeof f.special_machines === 'string' ? f.special_machines.split(',').map((s)=>s.trim()) : [];
        return searchMatch && (selected.admin_district.length === 0 || typeof f.admin_district === 'string' && selected.admin_district.includes(f.admin_district)) && moqMatch && monthlyCapacityMatch && (selected.business_type.length === 0 || businessTypeArr.filter((v)=>typeof v === 'string').some((v)=>selected.business_type.includes(v))) && (selected.distribution.length === 0 || distributionArr.filter((v)=>typeof v === 'string').some((v)=>selected.distribution.includes(v))) && (selected.delivery.length === 0 || deliveryArr.filter((v)=>typeof v === 'string').some((v)=>selected.delivery.includes(v))) && (selected.items.length === 0 || itemList.filter((i)=>typeof i === 'string').some((i)=>selected.items.includes(i))) && (selected.equipment.length === 0 || equipmentArr.filter((v)=>typeof v === 'string').some((v)=>selected.equipment.includes(v))) && (selected.sewing_machines.length === 0 || sewingArr.some((v)=>selected.sewing_machines.includes(v))) && (selected.pattern_machines.length === 0 || patternArr.some((v)=>selected.pattern_machines.includes(v))) && (selected.special_machines.length === 0 || specialArr.some((v)=>selected.special_machines.includes(v))) && (selected.factory_type.length === 0 || typeof f.factory_type === 'string' && selected.factory_type.includes(f.factory_type)) && (selected.main_fabrics.length === 0 || typeof f.main_fabrics === 'string' && selected.main_fabrics.includes(f.main_fabrics)) && (selected.processes.length === 0 || typeof f.processes === 'string' && selected.processes.includes(f.processes));
    });
    // 필터 뱃지
    const badges = Object.entries(selected).flatMap(([key, arr])=>arr.map((val)=>({
                key,
                val
            })));
    // 아코디언 열림/닫힘 상태 관리
    const [openFilter, setOpenFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        process: true,
        region: true,
        items: true,
        moq: false,
        equipment: false
    });
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
    // 옵션 변수는 모두 const로 한 번만 선언 (함수와 변수명 겹치지 않게 *_Options로 명명)
    const processesOptions = Array.isArray(getOptions('processes')) ? getOptions('processes') : [];
    const regionOptions = Array.isArray(getOptions('admin_district')) ? getOptions('admin_district') : [];
    const sewingMachineOptions = Array.isArray(getOptions('sewing_machines')) ? getOptions('sewing_machines') : [];
    const patternMachineOptions = Array.isArray(getOptions('pattern_machines')) ? getOptions('pattern_machines') : [];
    const specialMachineOptions = Array.isArray(getOptions('special_machines')) ? getOptions('special_machines') : [];
    const itemOptionsAll = Array.isArray(getOptions('items')) ? getOptions('items') : [];
    const mainFabricsOptions = Array.isArray(getOptions('main_fabrics')) ? getOptions('main_fabrics') : [];
    // 카드별 칩을 공장 id 기준으로 고정
    const cardFabricsById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FactoriesPage.useMemo[cardFabricsById]": ()=>{
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
            // id가 없으면 idx로 fallback
            return Object.fromEntries(factories.map({
                "FactoriesPage.useMemo[cardFabricsById]": (f, idx)=>{
                    // id 또는 idx로 seed 고정
                    const seed = String(f.id ?? idx);
                    // 간단한 해시로 seed 고정
                    let hash = 0;
                    for(let i = 0; i < seed.length; i++)hash = (hash << 5) - hash + seed.charCodeAt(i);
                    // hash 기반 shuffle
                    const shuffled = [
                        ...fabricChips
                    ].sort({
                        "FactoriesPage.useMemo[cardFabricsById].shuffled": (a, b)=>{
                            const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
                            const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
                            return h1 - h2;
                        }
                    }["FactoriesPage.useMemo[cardFabricsById].shuffled"]);
                    // hash 기반 개수(1~2개)
                    const count = Math.abs(hash) % 2 + 1;
                    return [
                        f.id ?? idx,
                        shuffled.slice(0, count)
                    ];
                }
            }["FactoriesPage.useMemo[cardFabricsById]"]));
        }
    }["FactoriesPage.useMemo[cardFabricsById]"], [
        factories
    ]);
    // FactoryMap 동적 import (SSR 비활성화)
    const FactoryMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/components/FactoryMap.tsx [app-client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
        loadableGenerated: {
            modules: [
                "[project]/components/FactoryMap.tsx [app-client] (ecmascript, next/dynamic entry)"
            ]
        },
        ssr: false
    });
    const [showMobileFilter, setShowMobileFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-[1400px] mx-auto py-16 flex flex-col gap-8 px-6",
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-10 text-lg",
                children: "공장 정보를 불러오는 중입니다..."
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 230,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-[40px] font-extrabold text-gray-900 mb-2",
                        children: "봉제공장 찾기"
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-gray-500 mb-8",
                        children: "퀄리티 좋은 의류 제작, 지금 바로 견적을 요청해보세요."
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 231,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lg:hidden flex mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "flex items-center gap-2 px-4 py-2 bg-[#333] text-white rounded-lg font-semibold shadow",
                    onClick: ()=>setShowMobileFilter(true),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "🔍"
                        }, void 0, false, {
                            fileName: "[project]/app/factories/page.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this),
                        " 필터"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/factories/page.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 236,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-row gap-12 items-start w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "w-72 shrink-0 hidden lg:block",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl mb-6 flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-bold mb-2 flex items-center justify-between text-lg pt-4 pb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "필터"
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelected({
                                                    admin_district: [],
                                                    moq: [],
                                                    monthly_capacity: [],
                                                    business_type: [],
                                                    distribution: [],
                                                    delivery: [],
                                                    items: [],
                                                    equipment: [],
                                                    sewing_machines: [],
                                                    pattern_machines: [],
                                                    special_machines: [],
                                                    factory_type: [],
                                                    main_fabrics: [],
                                                    processes: []
                                                }),
                                            className: "flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition",
                                            title: "필터 초기화",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"], {
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 257,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 248,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                    className: "my-2 border-gray-200"
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 260,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        process: !f.process
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "공정",
                                                        selected.processes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.processes.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 267,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 264,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 263,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.process && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: processesOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.processes?.includes?.(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                processes: sel.processes?.includes?.(opt) ? sel.processes.filter((v)=>v !== opt) : [
                                                                    ...sel.processes || [],
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 273,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 262,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        region: !f.region
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "지역",
                                                        selected.admin_district.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.admin_district.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 299,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.region ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 295,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: regionOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.admin_district.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                admin_district: sel.admin_district.includes(opt) ? sel.admin_district.filter((v)=>v !== opt) : [
                                                                    ...sel.admin_district,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 305,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 294,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        moq: !f.moq
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "MOQ(최소수량)",
                                                        selected.moq.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.moq.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 331,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.moq ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 327,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.moq && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: moqRanges.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.moq.includes(opt.label) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                moq: sel.moq.includes(opt.label) ? sel.moq.filter((v)=>v !== opt.label) : [
                                                                    ...sel.moq,
                                                                    opt.label
                                                                ]
                                                            })),
                                                    children: opt.label
                                                }, opt.label, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 337,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 326,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        sewing_machines: !f.sewing_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "재봉기",
                                                        selected.sewing_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.sewing_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.sewing_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 366,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 359,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.sewing_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: sewingMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.sewing_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                sewing_machines: sel.sewing_machines.includes(opt) ? sel.sewing_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.sewing_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 371,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 369,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        pattern_machines: !f.pattern_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "패턴기",
                                                        selected.pattern_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.pattern_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 392,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.pattern_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.pattern_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: patternMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.pattern_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                pattern_machines: sel.pattern_machines.includes(opt) ? sel.pattern_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.pattern_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 403,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 401,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 390,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        special_machines: !f.special_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "특수기",
                                                        selected.special_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.special_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 427,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 424,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.special_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 430,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 423,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.special_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: specialMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.special_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                special_machines: sel.special_machines.includes(opt) ? sel.special_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.special_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 435,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 433,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 422,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        items: !f.items
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "품목",
                                                        selected.items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.items.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 459,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.items ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 455,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.items && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: itemOptionsAll.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.items.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                items: sel.items.includes(opt) ? sel.items.filter((v)=>v !== opt) : [
                                                                    ...sel.items,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 467,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 465,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 454,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        main_fabrics: !f.main_fabrics
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "주요 원단",
                                                        selected.main_fabrics.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.main_fabrics.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 488,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 494,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 487,
                                            columnNumber: 15
                                        }, this),
                                        openFilter.main_fabrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: mainFabricsOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.main_fabrics.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                main_fabrics: sel.main_fabrics.includes(opt) ? sel.main_fabrics.filter((v)=>v !== opt) : [
                                                                    ...sel.main_fabrics,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 497,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 486,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/factories/page.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    showMobileFilter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl w-[90vw] max-w-md p-6 flex flex-col gap-2 relative border border-gray-200 shadow-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "absolute top-2 right-2 text-gray-500 hover:text-black text-2xl",
                                    onClick: ()=>setShowMobileFilter(false),
                                    "aria-label": "필터 닫기",
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 523,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-bold mb-2 flex items-center justify-between text-lg pt-4 pb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "필터"
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 532,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelected({
                                                    admin_district: [],
                                                    moq: [],
                                                    monthly_capacity: [],
                                                    business_type: [],
                                                    distribution: [],
                                                    delivery: [],
                                                    items: [],
                                                    equipment: [],
                                                    sewing_machines: [],
                                                    pattern_machines: [],
                                                    special_machines: [],
                                                    factory_type: [],
                                                    main_fabrics: [],
                                                    processes: []
                                                }),
                                            className: "flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 rounded transition",
                                            title: "필터 초기화",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"], {
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 540,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 533,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 531,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                    className: "my-2 border-gray-200"
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 543,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        process: !f.process
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-3",
                                                    children: [
                                                        "공정",
                                                        selected.processes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.processes.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 551,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 548,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.process ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 554,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 547,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.process && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2 mt-3",
                                            children: processesOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.processes?.includes?.(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                processes: sel.processes?.includes?.(opt) ? sel.processes.filter((v)=>v !== opt) : [
                                                                    ...sel.processes || [],
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 559,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 557,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 546,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        region: !f.region
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "지역",
                                                        selected.admin_district.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.admin_district.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 583,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.region ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 586,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 579,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: regionOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.admin_district.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                admin_district: sel.admin_district.includes(opt) ? sel.admin_district.filter((v)=>v !== opt) : [
                                                                    ...sel.admin_district,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 591,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 589,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 578,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        moq: !f.moq
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "MOQ(최소수량)",
                                                        selected.moq.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.moq.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 615,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 612,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.moq ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 618,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 611,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.moq && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: moqRanges.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.moq.includes(opt.label) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                moq: sel.moq.includes(opt.label) ? sel.moq.filter((v)=>v !== opt.label) : [
                                                                    ...sel.moq,
                                                                    opt.label
                                                                ]
                                                            })),
                                                    children: opt.label
                                                }, opt.label, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 623,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 621,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 610,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        sewing_machines: !f.sewing_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "재봉기",
                                                        selected.sewing_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.sewing_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 647,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 644,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.sewing_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 650,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 643,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.sewing_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: sewingMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.sewing_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                sewing_machines: sel.sewing_machines.includes(opt) ? sel.sewing_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.sewing_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 655,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 653,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 642,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        pattern_machines: !f.pattern_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "패턴기",
                                                        selected.pattern_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.pattern_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 679,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 676,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.pattern_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 682,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 675,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.pattern_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: patternMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.pattern_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                pattern_machines: sel.pattern_machines.includes(opt) ? sel.pattern_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.pattern_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 687,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 685,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 674,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        special_machines: !f.special_machines
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "특수기",
                                                        selected.special_machines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.special_machines.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 711,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 708,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.special_machines ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 714,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 707,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.special_machines && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: specialMachineOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.special_machines.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                special_machines: sel.special_machines.includes(opt) ? sel.special_machines.filter((v)=>v !== opt) : [
                                                                    ...sel.special_machines,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 719,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 717,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 706,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        items: !f.items
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "품목",
                                                        selected.items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.items.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 743,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 740,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.items ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 739,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.items && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2",
                                            children: itemOptionsAll.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: selected.items.includes(opt) ? "default" : "outline",
                                                    className: "rounded-full border px-4",
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                items: sel.items.includes(opt) ? sel.items.filter((v)=>v !== opt) : [
                                                                    ...sel.items,
                                                                    opt
                                                                ]
                                                            })),
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 751,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 749,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 738,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full flex items-center justify-between py-2",
                                            onClick: ()=>setOpenFilter((f)=>({
                                                        ...f,
                                                        main_fabrics: !f.main_fabrics
                                                    })),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[16px] flex items-center gap-1",
                                                    children: [
                                                        "주요 원단",
                                                        selected.main_fabrics.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center justify-center rounded-full bg-[#333333] text-white text-xs w-5 h-5",
                                                            children: selected.main_fabrics.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 775,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 772,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                    className: `w-5 h-5 transition-transform ${openFilter.main_fabrics ? '' : 'rotate-180'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 778,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 771,
                                            columnNumber: 17
                                        }, this),
                                        openFilter.main_fabrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2 pb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 781,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 770,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/factories/page.tsx",
                            lineNumber: 522,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 521,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0 flex flex-col items-stretch",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mb-4 items-center self-start w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        placeholder: "공장명, 키워드로 검색하세요.",
                                        className: "flex-1 w-full border rounded-[0.625rem] px-4 py-2 focus:border-black focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 793,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex bg-gray-100 rounded-lg p-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'list' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`,
                                                onClick: ()=>setView('list'),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 804,
                                                        columnNumber: 17
                                                    }, this),
                                                    " 목록"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 800,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `px-4 py-1 rounded-lg transition flex items-center gap-2 ${view === 'map' ? 'bg-white text-[#333] font-semibold shadow' : 'bg-transparent text-[#555] font-normal'}`,
                                                onClick: ()=>setView('map'),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 810,
                                                        columnNumber: 17
                                                    }, this),
                                                    " 지도"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/factories/page.tsx",
                                                lineNumber: 806,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 799,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 792,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-2 text-sm text-gray-500",
                                children: [
                                    filtered.length,
                                    "개"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 815,
                                columnNumber: 11
                            }, this),
                            badges.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 mb-4",
                                children: [
                                    badges.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-[#333333] text-white rounded-full px-3 py-1 text-[14px] font-semibold flex items-center gap-1",
                                            children: [
                                                b.val,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setSelected((sel)=>({
                                                                ...sel,
                                                                [b.key]: sel[b.key].filter((v)=>v !== b.val)
                                                            })),
                                                    className: "ml-1",
                                                    children: "×"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 822,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, b.key + b.val, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 820,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: "ghost",
                                        onClick: ()=>setSelected({
                                                admin_district: [],
                                                moq: [],
                                                monthly_capacity: [],
                                                business_type: [],
                                                distribution: [],
                                                delivery: [],
                                                items: [],
                                                equipment: [],
                                                sewing_machines: [],
                                                pattern_machines: [],
                                                special_machines: [],
                                                factory_type: [],
                                                main_fabrics: [],
                                                processes: []
                                            }),
                                        children: "전체 해제"
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 828,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 818,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: view === 'list' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
                                    children: Array.isArray(filtered) && filtered.length > 0 ? filtered.map((f, idx)=>{
                                        const displayName = typeof f.name === 'string' && f.name ? f.name : typeof f.company_name === 'string' && f.company_name ? f.company_name : '이름 없음';
                                        const mainItems = [
                                            f.top_items_upper,
                                            f.top_items_lower,
                                            f.top_items_outer,
                                            f.top_items_dress_skirt
                                        ].filter((v)=>typeof v === 'string' && v.length > 0).join(', ') || '-';
                                        const mainFabrics = typeof f.main_fabrics === 'string' && f.main_fabrics.length > 0 ? f.main_fabrics : '-';
                                        const randomFabrics = cardFabricsById[f.id ?? idx] || [];
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/factories/${f.id}`,
                                            className: "rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length],
                                                        alt: typeof f.company_name === 'string' ? f.company_name : '공장 이미지',
                                                        className: "object-cover w-full h-full rounded-xl",
                                                        width: 400,
                                                        height: 224,
                                                        priority: idx < 6
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/factories/page.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 852,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 863,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 flex flex-col p-4",
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
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 869,
                                                                    columnNumber: 31
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 867,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-bold text-base mb-1",
                                                            children: displayName
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 874,
                                                            columnNumber: 27
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
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 877,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-normal ml-2 flex-1 truncate",
                                                                    children: mainItems
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 878,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 876,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-bold mb-1 flex items-center",
                                                            style: {
                                                                color: '#333333',
                                                                opacity: 0.6
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "shrink-0",
                                                                    children: "주요원단"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 881,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-normal ml-2 flex-1 truncate",
                                                                    children: mainFabrics
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 882,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 880,
                                                            columnNumber: 27
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
                                                                    children: typeof f.moq === 'number' ? f.moq : typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? f.moq : typeof f.minOrder === 'number' ? f.minOrder : '-'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/factories/page.tsx",
                                                                    lineNumber: 885,
                                                                    columnNumber: 43
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/factories/page.tsx",
                                                            lineNumber: 884,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/factories/page.tsx",
                                                    lineNumber: 865,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, f.id ?? idx, true, {
                                            fileName: "[project]/app/factories/page.tsx",
                                            lineNumber: 850,
                                            columnNumber: 23
                                        }, this);
                                    }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-20 text-gray-400 text-lg col-span-3",
                                        children: "공장 데이터가 없습니다."
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 892,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 836,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FactoryMap, {
                                        factories: filtered,
                                        selectedFactoryId: filtered[0]?.id || "",
                                        onSelectFactory: ()=>{},
                                        height: "600px"
                                    }, void 0, false, {
                                        fileName: "[project]/app/factories/page.tsx",
                                        lineNumber: 898,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/factories/page.tsx",
                                    lineNumber: 896,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/factories/page.tsx",
                                lineNumber: 834,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/factories/page.tsx",
                        lineNumber: 790,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/factories/page.tsx",
                lineNumber: 244,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/factories/page.tsx",
        lineNumber: 229,
        columnNumber: 5
    }, this);
} // 주니어 개발자 설명:
 // - getTagColor 함수로 태그별 색상을 쉽게 관리할 수 있습니다.
 // - 필터 아코디언은 useState로 열림/닫힘 상태를 관리하며, 버튼 클릭 시 토글됩니다.
 // - 카드 내 태그는 map으로 렌더링하며, 공정/나염/자수 등은 색상, 주요 품목은 회색으로 구분합니다.
 // - Tailwind CSS로 스타일을 빠르게 적용할 수 있습니다. 
_s(FactoriesPage, "/tYZTsY3pijOsKi4NZ4zYQIVUcQ=");
_c = FactoriesPage;
var _c;
__turbopack_context__.k.register(_c, "FactoriesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_2439164c._.js.map