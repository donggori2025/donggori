module.exports = {

"[project]/app/terms/[type]/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TermsDetailPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
const TERMS_DATA = {
    service: {
        title: "이용약관(임시)",
        content: `이곳은 서비스 이용약관 임시 데이터입니다.\n\n1. 목적\n2. 이용조건\n3. 기타 조항 ...`
    },
    privacy: {
        title: "개인정보이용동의(임시)",
        content: `이곳은 개인정보이용동의 임시 데이터입니다.\n\n1. 수집항목\n2. 이용목적\n3. 보유기간 ...`
    },
    marketing: {
        title: "마케팅정보활용동의(임시)",
        content: `이곳은 마케팅정보활용동의 임시 데이터입니다.\n\n1. 수집 및 이용목적\n2. 제공항목 ...`
    }
};
function TermsDetailPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const type = params?.type;
    const data = TERMS_DATA[type] || {
        title: "약관",
        content: "임시 약관 내용입니다."
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-2xl mx-auto py-16 px-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-4",
                children: data.title
            }, void 0, false, {
                fileName: "[project]/app/terms/[type]/page.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm",
                children: data.content
            }, void 0, false, {
                fileName: "[project]/app/terms/[type]/page.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/terms/[type]/page.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=app_terms_%5Btype%5D_page_tsx_52f53207._.js.map