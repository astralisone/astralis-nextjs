(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateReadingTime",
    ()=>calculateReadingTime,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatRelativeTime",
    ()=>formatRelativeTime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
function formatDate(date) {
    if (!date) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(typeof date === 'string' ? new Date(date) : date);
}
function formatDateTime(date) {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
function formatRelativeTime(date) {
    if (!date) return 'Unknown time';
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(date);
}
function calculateReadingTime(content) {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).filter((word)=>word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-2xl border border-border/50 bg-card text-card-foreground shadow-elevation-1 backdrop-blur-sm transition-all duration-200 hover:shadow-elevation-2 hover:border-primary/20", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Card;
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-2 p-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 23,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = CardHeader;
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-bold leading-tight tracking-tight text-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = CardTitle;
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-base text-neutral-300 leading-relaxed", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 50,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = CardDescription;
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-8 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = CardContent;
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-8 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/card.tsx",
        lineNumber: 70,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = CardFooter;
CardFooter.displayName = "CardFooter";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm", {
    variants: {
        variant: {
            default: "border-transparent bg-gradient-to-r from-purple-500/80 to-violet-500/80 text-white hover:from-purple-600/90 hover:to-violet-600/90 shadow-lg shadow-purple-500/25",
            secondary: "border-white/20 bg-white/10 text-gray-200 hover:bg-white/20 hover:border-white/30",
            destructive: "border-transparent bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white hover:from-red-600/90 hover:to-pink-600/90 shadow-lg shadow-red-500/25",
            outline: "text-foreground border-white/20 hover:bg-white/10"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/badge.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            glass: "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, loading, loadingText, children, disabled, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    const isDisabled = disabled || loading;
    const buttonContent = loading && loadingText ? loadingText : children;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        ...props,
        children: loading && !asChild ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mr-2",
                    role: "status",
                    "aria-hidden": "true",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/ui/button.tsx",
                        lineNumber: 64,
                        columnNumber: 15
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/ui/button.tsx",
                    lineNumber: 63,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                buttonContent
            ]
        }, void 0, true) : buttonContent
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/button.tsx",
        lineNumber: 54,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/separator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Separator",
    ()=>Separator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@radix-ui/react-separator/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Separator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, orientation = "horizontal", decorative = true, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        decorative: decorative,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/separator.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Separator;
Separator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Separator$React.forwardRef");
__turbopack_context__.k.register(_c1, "Separator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/tabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@radix-ui/react-tabs/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Tabs = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TabsList = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/tabs.tsx",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = TabsList;
TabsList.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"].displayName;
const TabsTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/tabs.tsx",
        lineNumber: 29,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = TabsTrigger;
TabsTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"].displayName;
const TabsContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/tabs.tsx",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = TabsContent;
TabsContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "TabsList$React.forwardRef");
__turbopack_context__.k.register(_c1, "TabsList");
__turbopack_context__.k.register(_c2, "TabsTrigger$React.forwardRef");
__turbopack_context__.k.register(_c3, "TabsTrigger");
__turbopack_context__.k.register(_c4, "TabsContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "TabsContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/store/cart.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        items: [],
        total: 0,
        addItem: (item)=>{
            set((state)=>{
                const existingItem = state.items.find((i)=>i.id === item.id);
                const items = existingItem ? state.items.map((i)=>i.id === item.id ? {
                        ...i,
                        quantity: i.quantity + 1
                    } : i) : [
                    ...state.items,
                    {
                        ...item,
                        quantity: 1
                    }
                ];
                return {
                    items,
                    total: items.reduce((acc, item)=>acc + Number(item.price) * item.quantity, 0)
                };
            });
        },
        removeItem: (id)=>{
            set((state)=>{
                const items = state.items.filter((i)=>i.id !== id);
                return {
                    items,
                    total: items.reduce((acc, item)=>acc + Number(item.price) * item.quantity, 0)
                };
            });
        },
        updateQuantity: (id, quantity)=>{
            set((state)=>{
                const items = state.items.map((item)=>item.id === id ? {
                        ...item,
                        quantity
                    } : item);
                return {
                    items,
                    total: items.reduce((acc, item)=>acc + Number(item.price) * item.quantity, 0)
                };
            });
        },
        clearCart: ()=>{
            set({
                items: [],
                total: 0
            });
        }
    }), {
    name: 'cart-storage'
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/store/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/store/cart.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/use-toast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_VALUE;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id,
        dismiss,
        update
    };
}
function useToast() {
    _s();
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useToast.useEffect": ()=>{
            listeners.push(setState);
            return ({
                "useToast.useEffect": ()=>{
                    const index = listeners.indexOf(setState);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            })["useToast.useEffect"];
        }
    }["useToast.useEffect"], [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
_s(useToast, "SPWE98mLGnlsnNfIwu/IAKTSZtk=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RelatedProductsSkeleton",
    ()=>RelatedProductsSkeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/card.tsx [app-client] (ecmascript)");
;
;
function RelatedProductsSkeleton({ count = 4 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-16",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 14,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-4 bg-white/5 rounded w-64 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 15,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                            lineNumber: 13,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden sm:flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 w-10 bg-white/10 rounded-lg animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 18,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 w-10 bg-white/10 rounded-lg animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 19,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                            lineNumber: 17,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6",
                    children: Array.from({
                        length: count
                    }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "glass-card border-white/10 h-full flex flex-col overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "aspect-[16/10] sm:aspect-[4/3] bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-full bg-white/5 animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 32,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-3 left-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-6 w-16 bg-purple-600/30 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                lineNumber: 35,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 34,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 31,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "p-4 flex-1 flex flex-col",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-5 w-20 bg-white/10 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                lineNumber: 42,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 41,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-5 bg-white/10 rounded w-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 47,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-5 bg-white/10 rounded w-3/4 animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 46,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-3 flex-1 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 bg-white/5 rounded w-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 53,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 bg-white/5 rounded w-5/6 animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 52,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-6 bg-white/10 rounded w-16 animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                lineNumber: 59,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 58,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 h-8 bg-purple-500/20 rounded-lg animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 64,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 h-8 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-lg animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                                    lineNumber: 65,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 63,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-6 bg-white/5 rounded mt-2 animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                            lineNumber: 69,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                            lineNumber: 26,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = RelatedProductsSkeleton;
var _c;
__turbopack_context__.k.register(_c, "RelatedProductsSkeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RelatedProducts",
    ()=>RelatedProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/store/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/store/cart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$related$2d$products$2d$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/marketplace/related-products-skeleton.tsx [app-client] (ecmascript)");
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
;
;
function RelatedProducts({ currentProductId, categorySlug, tags = [], maxItems = 4, className = "" }) {
    _s();
    const [relatedProducts, setRelatedProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [touchStart, setTouchStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [touchEnd, setTouchEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])({
        "RelatedProducts.useCart[addItem]": (state)=>state.addItem
    }["RelatedProducts.useCart[addItem]"]);
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RelatedProducts.useEffect": ()=>{
            fetchRelatedProducts();
        }
    }["RelatedProducts.useEffect"], [
        currentProductId
    ]);
    const fetchRelatedProducts = async ()=>{
        try {
            setLoading(true);
            setError(null);
            // Try the recommendations endpoint first
            let response;
            try {
                response = await fetch(`/api/marketplace/recommendations/${currentProductId}`);
            } catch  {
                // Fallback to getting products from the same category
                const fallbackUrl = categorySlug ? `/api/marketplace?category=${categorySlug}&limit=${maxItems + 1}` : `/api/marketplace?limit=${maxItems + 1}`;
                response = await fetch(fallbackUrl);
            }
            if (!response.ok) {
                throw new Error('Failed to fetch related products');
            }
            const data = await response.json();
            if (data.status === 'success') {
                let products;
                if ('items' in data.data) {
                    // Fallback response format from /api/marketplace endpoint
                    products = data.data.items;
                } else if ('recommendations' in data.data) {
                    // Recommendations API response format
                    products = data.data.recommendations;
                } else {
                    // Direct array format (legacy)
                    products = data.data;
                }
                // Filter out the current product and limit results
                const filtered = products.filter((product)=>product.id !== currentProductId).slice(0, maxItems);
                setRelatedProducts(filtered);
            } else {
                throw new Error(data.message || 'Failed to fetch related products');
            }
        } catch (err) {
            console.error('Error fetching related products:', err);
            setError('Unable to load related products');
        } finally{
            setLoading(false);
        }
    };
    const handleAddToCart = (e, product)=>{
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.title,
            price: Number(product.discountPrice || product.price),
            image: product.imageUrl,
            quantity: 1
        });
        toast({
            title: "Added to cart",
            description: `${product.title} has been added to your cart.`
        });
    };
    const handleTouchStart = (e)=>{
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e)=>{
        setTouchEnd(e.targetTouches[0].clientX);
    };
    const handleTouchEnd = ()=>{
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe && currentIndex < relatedProducts.length - getVisibleCount()) {
            setCurrentIndex((prev)=>prev + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex((prev)=>prev - 1);
        }
    };
    const getVisibleCount = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            if (window.innerWidth >= 1280) return 4 // xl
            ;
            if (window.innerWidth >= 768) return 3 // md
            ;
            if (window.innerWidth >= 640) return 2 // sm
            ;
            return 1 // mobile
            ;
        }
        //TURBOPACK unreachable
        ;
    };
    const nextSlide = ()=>{
        setCurrentIndex((prev)=>Math.min(prev + 1, relatedProducts.length - getVisibleCount()));
    };
    const prevSlide = ()=>{
        setCurrentIndex((prev)=>Math.max(prev - 1, 0));
    };
    const getPrice = (product)=>{
        if (product.customPricing) {
            if (product.priceRangeMin && product.priceRangeMax) {
                return `$${product.priceRangeMin} - $${product.priceRangeMax}`;
            }
            return 'Contact for pricing';
        }
        return product.discountPrice || product.price;
    };
    const hasDiscount = (product)=>product.discountPrice && product.discountPrice < product.price;
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: className,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$related$2d$products$2d$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RelatedProductsSkeleton"], {
                count: maxItems
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                lineNumber: 201,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
            lineNumber: 200,
            columnNumber: 7
        }, this);
    }
    if (error || relatedProducts.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: `py-16 ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl md:text-3xl font-bold text-white mb-8 text-center",
                        children: "Related Products"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                        lineNumber: 210,
                        columnNumber: 11
                    }, this),
                    error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center py-12 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "glass-card p-8 rounded-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    className: "w-12 h-12 text-yellow-500 mx-auto mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 216,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300 mb-4",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 217,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    onClick: fetchRelatedProducts,
                                    className: "bg-white/5 hover:bg-white/10",
                                    children: "Try Again"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 218,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                            lineNumber: 215,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                        lineNumber: 214,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-400",
                            children: "No related products found."
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                            lineNumber: 229,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                        lineNumber: 228,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                lineNumber: 209,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
            lineNumber: 208,
            columnNumber: 7
        }, this);
    }
    const visibleCount = getVisibleCount();
    const canNavigateLeft = currentIndex > 0;
    const canNavigateRight = currentIndex < relatedProducts.length - visibleCount;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: `py-16 ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent",
                                    children: "Related Products"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 247,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400 mt-2",
                                    children: "Discover similar products you might like"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 250,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                            lineNumber: 246,
                            columnNumber: 11
                        }, this),
                        relatedProducts.length > visibleCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden sm:flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    size: "icon",
                                    onClick: prevSlide,
                                    disabled: !canNavigateLeft,
                                    className: "glass border-white/20 hover:border-purple-500/50 disabled:opacity-30",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                        lineNumber: 265,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 258,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    size: "icon",
                                    onClick: nextSlide,
                                    disabled: !canNavigateRight,
                                    className: "glass border-white/20 hover:border-purple-500/50 disabled:opacity-30",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                        lineNumber: 274,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 267,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                            lineNumber: 257,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                    lineNumber: 245,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "flex gap-6",
                        animate: {
                            x: `calc(-${currentIndex * (100 / visibleCount)}% - ${currentIndex * 1.5}rem)`
                        },
                        transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        },
                        onTouchStart: handleTouchStart,
                        onTouchMove: handleTouchMove,
                        onTouchEnd: handleTouchEnd,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                            children: relatedProducts.map((product, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: -20
                                    },
                                    transition: {
                                        duration: 0.4,
                                        delay: index * 0.1
                                    },
                                    className: "flex-shrink-0 w-full sm:w-1/2 md:w-1/3 xl:w-1/4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                        className: "group overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 glass-card border-white/10 hover:border-white/20 h-full flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/marketplace/${product.slug}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: product.imageUrl,
                                                            alt: product.title,
                                                            className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                                                            loading: "lazy"
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 306,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-3 left-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            className: "bg-purple-600 text-white border-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                                    className: "w-3 h-3 mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                    lineNumber: 317,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Digital"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 23
                                                    }, this),
                                                    product.featured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-3 right-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            className: "bg-yellow-600 text-white border-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                    className: "w-3 h-3 mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                    lineNumber: 325,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Featured"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 324,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 323,
                                                        columnNumber: 25
                                                    }, this),
                                                    hasDiscount(product) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute bottom-3 left-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            className: "bg-red-600 text-white border-0",
                                                            children: [
                                                                "Save $",
                                                                (product.price - product.discountPrice).toFixed(0)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 333,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                lineNumber: 304,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                                className: "p-4 flex-1 flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            variant: "outline",
                                                            className: "text-xs",
                                                            children: product.category.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 343,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/marketplace/${product.slug}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-base font-semibold mb-2 text-white group-hover:text-purple-200 transition-colors line-clamp-2",
                                                            children: product.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 350,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-gray-300 line-clamp-2 mb-3 flex-1",
                                                        children: product.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 356,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-4",
                                                        children: product.customPricing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-bold text-purple-400",
                                                            children: getPrice(product)
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 27
                                                        }, this) : hasDiscount(product) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-lg font-bold text-green-400",
                                                                    children: [
                                                                        "$",
                                                                        product.discountPrice
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs text-gray-400 line-through",
                                                                    children: [
                                                                        "$",
                                                                        product.price
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                    lineNumber: 371,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 367,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-lg font-bold text-white",
                                                            children: [
                                                                "$",
                                                                product.price
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                variant: "outline",
                                                                size: "sm",
                                                                className: "flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs",
                                                                onClick: (e)=>handleAddToCart(e, product),
                                                                disabled: product.status !== 'AVAILABLE',
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                                        className: "w-3 h-3 mr-1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                        lineNumber: 391,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Add"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                lineNumber: 384,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                size: "sm",
                                                                className: "flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 text-xs",
                                                                onClick: (e)=>{
                                                                    e.preventDefault();
                                                                    handleAddToCart(e, product);
                                                                    window.location.href = '/checkout';
                                                                },
                                                                disabled: product.status !== 'AVAILABLE',
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                                        className: "w-3 h-3 mr-1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                        lineNumber: 404,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Buy"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                                lineNumber: 394,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 383,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        asChild: true,
                                                        variant: "ghost",
                                                        size: "sm",
                                                        className: "w-full text-gray-300 hover:text-white text-xs mt-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `/marketplace/${product.slug}`,
                                                            children: "View Details"
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                            lineNumber: 416,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                        lineNumber: 410,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                                lineNumber: 340,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                        lineNumber: 302,
                                        columnNumber: 19
                                    }, this)
                                }, product.id, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                    lineNumber: 294,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                            lineNumber: 292,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                        lineNumber: 282,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                    lineNumber: 281,
                    columnNumber: 9
                }, this),
                relatedProducts.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mt-6 sm:hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: Array.from({
                            length: Math.ceil(relatedProducts.length / visibleCount)
                        }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-2 h-2 rounded-full transition-all duration-300 ${Math.floor(currentIndex / visibleCount) === index ? 'bg-purple-500' : 'bg-white/30'}`
                            }, index, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                                lineNumber: 433,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                        lineNumber: 431,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
                    lineNumber: 430,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
            lineNumber: 243,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx",
        lineNumber: 242,
        columnNumber: 5
    }, this);
}
_s(RelatedProducts, "0s7yolRa8rUc+zltXZ82IZiAkFo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = RelatedProducts;
var _c;
__turbopack_context__.k.register(_c, "RelatedProducts");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip,
    "TooltipContent",
    ()=>TooltipContent,
    "TooltipProvider",
    ()=>TooltipProvider,
    "TooltipTrigger",
    ()=>TooltipTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const TooltipProvider = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const Tooltip = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TooltipTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const TooltipContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        sideOffset: sideOffset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/tooltip.tsx",
        lineNumber: 15,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = TooltipContent;
TooltipContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "TooltipContent$React.forwardRef");
__turbopack_context__.k.register(_c1, "TooltipContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrustBadgePresets",
    ()=>TrustBadgePresets,
    "TrustBadges",
    ()=>TrustBadges
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/truck.js [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$headphones$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Headphones$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/headphones.js [app-client] (ecmascript) <export default as Headphones>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const trustBadges = {
    'secure-payment': {
        id: 'secure-payment',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
        label: 'Secure Payment',
        description: 'Your payment information is encrypted and secure',
        color: 'text-green-400',
        variant: 'success'
    },
    'money-back': {
        id: 'money-back',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"],
        label: '30-Day Guarantee',
        description: 'Full refund if not satisfied within 30 days',
        color: 'text-blue-400',
        variant: 'info'
    },
    'free-shipping': {
        id: 'free-shipping',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
        label: 'Free Shipping',
        description: 'Free delivery on all digital products',
        color: 'text-green-400',
        variant: 'success'
    },
    'instant-delivery': {
        id: 'instant-delivery',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        label: 'Instant Delivery',
        description: 'Digital products delivered immediately',
        color: 'text-yellow-400',
        variant: 'warning'
    },
    'verified-seller': {
        id: 'verified-seller',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
        label: 'Verified Seller',
        description: 'Trusted and verified by our team',
        color: 'text-blue-400',
        variant: 'info'
    },
    '24-7-support': {
        id: '24-7-support',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$headphones$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Headphones$3e$__["Headphones"],
        label: '24/7 Support',
        description: 'Round-the-clock customer support',
        color: 'text-purple-400',
        variant: 'default'
    },
    'ssl-secure': {
        id: 'ssl-secure',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"],
        label: 'SSL Secured',
        description: 'All data transmitted is encrypted',
        color: 'text-green-400',
        variant: 'success'
    },
    'bestseller': {
        id: 'bestseller',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"],
        label: 'Bestseller',
        description: 'One of our most popular products',
        color: 'text-yellow-400',
        variant: 'warning'
    },
    'new-product': {
        id: 'new-product',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
        label: 'New',
        description: 'Recently added to our marketplace',
        color: 'text-purple-400',
        variant: 'default'
    },
    'warranty': {
        id: 'warranty',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        label: 'Warranty',
        description: 'Covered by our comprehensive warranty',
        color: 'text-blue-400',
        variant: 'info'
    },
    'fast-delivery': {
        id: 'fast-delivery',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
        label: 'Fast Delivery',
        description: 'Quick turnaround time',
        color: 'text-green-400',
        variant: 'success'
    },
    'customer-choice': {
        id: 'customer-choice',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
        label: 'Customer Choice',
        description: 'Highly rated by customers',
        color: 'text-red-400',
        variant: 'default'
    }
};
function TrustBadges({ badges = [], layout = 'horizontal', size = 'md', showLabels = true, className = "", productType = 'PRODUCT', features = {} }) {
    // Auto-determine badges based on features if not explicitly provided
    const determinedBadges = badges.length > 0 ? badges : (()=>{
        const autoBadges = [];
        // Always include secure payment and SSL
        autoBadges.push('secure-payment', 'ssl-secure');
        // Add based on features
        if (features.hasGuarantee) autoBadges.push('money-back');
        if (features.hasFreeShipping) autoBadges.push('free-shipping');
        if (features.hasInstantDelivery) autoBadges.push('instant-delivery');
        if (features.isVerifiedSeller) autoBadges.push('verified-seller');
        if (features.hasSupport) autoBadges.push('24-7-support');
        if (features.isBestseller) autoBadges.push('bestseller');
        if (features.isNewProduct) autoBadges.push('new-product');
        if (features.hasWarranty) autoBadges.push('warranty');
        // Add product type specific badges
        if (productType === 'PRODUCT') {
            if (!autoBadges.includes('instant-delivery')) {
                autoBadges.push('fast-delivery');
            }
        } else {
            autoBadges.push('customer-choice');
        }
        return autoBadges;
    })();
    const activeBadges = determinedBadges.map((badgeId)=>trustBadges[badgeId]).filter(Boolean);
    if (activeBadges.length === 0) {
        return null;
    }
    const sizeClasses = {
        sm: {
            icon: 'w-3 h-3',
            badge: 'text-xs px-2 py-1',
            gap: 'gap-1'
        },
        md: {
            icon: 'w-4 h-4',
            badge: 'text-sm px-3 py-1.5',
            gap: 'gap-2'
        },
        lg: {
            icon: 'w-5 h-5',
            badge: 'text-base px-4 py-2',
            gap: 'gap-3'
        }
    };
    const layoutClasses = {
        horizontal: 'flex flex-wrap',
        vertical: 'flex flex-col',
        grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    };
    const currentSize = sizeClasses[size];
    const currentLayout = layoutClasses[layout];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${currentLayout} ${currentSize.gap} ${className}`,
            children: activeBadges.map((badge, index)=>{
                const IconComponent = badge.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                            asChild: true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    scale: 0.8
                                },
                                animate: {
                                    opacity: 1,
                                    scale: 1
                                },
                                transition: {
                                    delay: index * 0.1
                                },
                                className: "cursor-help",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    className: `
                      glass-badge border-border/50 hover:border-border transition-all duration-200
                      ${currentSize.badge}
                      ${layout === 'vertical' ? 'justify-start' : ''}
                      group hover:scale-105
                    `,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                                            className: `${currentSize.icon} ${badge.color} mr-1.5`
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                            lineNumber: 247,
                                            columnNumber: 21
                                        }, this),
                                        showLabels && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-foreground group-hover:text-white transition-colors",
                                            children: badge.label
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                            lineNumber: 249,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                    lineNumber: 238,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                lineNumber: 232,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                            lineNumber: 231,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                            side: "top",
                            className: "glass-elevated max-w-xs text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-medium text-foreground",
                                    children: badge.label
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                    lineNumber: 260,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mt-1",
                                    children: badge.description
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                                    lineNumber: 261,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                            lineNumber: 256,
                            columnNumber: 15
                        }, this)
                    ]
                }, badge.id, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
                    lineNumber: 230,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
            lineNumber: 225,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
        lineNumber: 224,
        columnNumber: 5
    }, this);
}
_c = TrustBadges;
const TrustBadgePresets = {
    ecommerce: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustBadges, {
        features: {
            hasSecurePayment: true,
            hasFreeShipping: true,
            hasGuarantee: true,
            hasSupport: true
        },
        layout: "horizontal",
        size: "md"
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
        lineNumber: 274,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    digitalProduct: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustBadges, {
        features: {
            hasSecurePayment: true,
            hasInstantDelivery: true,
            hasGuarantee: true,
            isVerifiedSeller: true
        },
        layout: "horizontal",
        size: "md",
        productType: "PRODUCT"
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
        lineNumber: 287,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    service: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustBadges, {
        features: {
            hasSecurePayment: true,
            hasSupport: true,
            isVerifiedSeller: true,
            hasGuarantee: true
        },
        layout: "horizontal",
        size: "md",
        productType: "SERVICE"
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
        lineNumber: 301,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)),
    premium: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustBadges, {
        features: {
            hasSecurePayment: true,
            hasInstantDelivery: true,
            hasGuarantee: true,
            hasSupport: true,
            isVerifiedSeller: true,
            hasWarranty: true
        },
        layout: "grid",
        size: "lg"
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx",
        lineNumber: 315,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0))
};
var _c;
__turbopack_context__.k.register(_c, "TrustBadges");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/ui/progress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@radix-ui/react-progress/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Progress = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, value, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "h-full w-full flex-1 bg-primary transition-all",
            style: {
                transform: `translateX(-${100 - (value || 0)}%)`
            }
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/ui/progress.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/ui/progress.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Progress;
Progress.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Progress$React.forwardRef");
__turbopack_context__.k.register(_c1, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UrgencyIndicators",
    ()=>UrgencyIndicators,
    "UrgencyPresets",
    ()=>UrgencyPresets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/progress.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function UrgencyIndicators({ productId, stock = 0, viewerCount = 0, salesCount = 0, timeLeft = 0, discount, recentActivity, lowStockThreshold = 10, showCountdown = true, showViewers = true, showSales = true, showStock = true, className = "" }) {
    _s();
    const [currentViewers, setCurrentViewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(viewerCount);
    const [countdown, setCountdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(timeLeft);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Simulate live viewer count updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UrgencyIndicators.useEffect": ()=>{
            if (!showViewers || viewerCount === 0) return;
            const interval = setInterval({
                "UrgencyIndicators.useEffect.interval": ()=>{
                    // Add some randomness to make it feel more realistic
                    const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
                    ;
                    const newCount = Math.max(0, currentViewers + change);
                    setCurrentViewers(Math.min(newCount, viewerCount + 10)); // Cap at original + 10
                }
            }["UrgencyIndicators.useEffect.interval"], 3000 + Math.random() * 2000) // 3-5 seconds
            ;
            return ({
                "UrgencyIndicators.useEffect": ()=>clearInterval(interval)
            })["UrgencyIndicators.useEffect"];
        }
    }["UrgencyIndicators.useEffect"], [
        currentViewers,
        viewerCount,
        showViewers
    ]);
    // Countdown timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UrgencyIndicators.useEffect": ()=>{
            if (!showCountdown || countdown <= 0) return;
            const interval = setInterval({
                "UrgencyIndicators.useEffect.interval": ()=>{
                    setCountdown({
                        "UrgencyIndicators.useEffect.interval": (prev)=>{
                            if (prev <= 1) {
                                setIsVisible(false);
                                return 0;
                            }
                            return prev - 1;
                        }
                    }["UrgencyIndicators.useEffect.interval"]);
                }
            }["UrgencyIndicators.useEffect.interval"], 1000);
            return ({
                "UrgencyIndicators.useEffect": ()=>clearInterval(interval)
            })["UrgencyIndicators.useEffect"];
        }
    }["UrgencyIndicators.useEffect"], [
        countdown,
        showCountdown
    ]);
    // Calculate urgency metrics
    const isLowStock = stock > 0 && stock <= lowStockThreshold;
    const hasHighViewers = currentViewers >= 10;
    const hasRecentSales = recentActivity && recentActivity.purchases > 0;
    const hasDiscount = discount && discount.percentage > 0;
    const hasCountdown = countdown > 0;
    // Format time display
    const formatTime = (seconds)=>{
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };
    const indicators = [];
    // Live viewers indicator
    if (showViewers && currentViewers > 0) {
        indicators.push({
            id: 'viewers',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    x: -20
                },
                animate: {
                    opacity: 1,
                    x: 0
                },
                className: "flex items-center gap-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-2 h-2 bg-green-400 rounded-full animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                            lineNumber: 127,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                            className: "w-4 h-4 text-green-400"
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                            lineNumber: 128,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-medium",
                            children: currentViewers
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                            lineNumber: 129,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground",
                            children: "viewing"
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                    lineNumber: 126,
                    columnNumber: 11
                }, this)
            }, "viewers", false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 120,
                columnNumber: 9
            }, this),
            priority: 3
        });
    }
    // Low stock indicator
    if (showStock && isLowStock) {
        const stockPercentage = stock / lowStockThreshold * 100;
        indicators.push({
            id: 'stock',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.8
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                        className: "w-4 h-4 text-orange-400"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-orange-400",
                                children: [
                                    "Only ",
                                    stock,
                                    " left!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                                value: stockPercentage,
                                className: "w-16 h-1"
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this)
                ]
            }, "stock", true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 145,
                columnNumber: 9
            }, this),
            priority: 5
        });
    }
    // Sales activity indicator
    if (showSales && hasRecentSales) {
        indicators.push({
            id: 'sales',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: 10
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                        className: "w-4 h-4 text-red-400"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-red-400",
                                children: recentActivity?.purchases
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground ml-1",
                                children: [
                                    "sold ",
                                    recentActivity?.timeframe
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 180,
                        columnNumber: 11
                    }, this)
                ]
            }, "sales", true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 173,
                columnNumber: 9
            }, this),
            priority: 4
        });
    }
    // Discount countdown
    if (hasDiscount && hasCountdown) {
        indicators.push({
            id: 'discount',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.8
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                        className: `w-4 h-4 ${countdown < 300 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 202,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-yellow-400",
                                children: [
                                    discount.percentage,
                                    "% OFF"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-xs ${countdown < 300 ? 'text-red-400' : 'text-muted-foreground'}`,
                                children: [
                                    formatTime(countdown),
                                    " left"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this)
                ]
            }, "discount", true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 196,
                columnNumber: 9
            }, this),
            priority: 6
        });
    }
    // General urgency indicators
    if (salesCount > 50) {
        indicators.push({
            id: 'bestseller',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    x: 20
                },
                animate: {
                    opacity: 1,
                    x: 0
                },
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                        className: "w-4 h-4 text-purple-400"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 229,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-purple-400 font-medium",
                        children: "Bestseller"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 230,
                        columnNumber: 11
                    }, this)
                ]
            }, "bestseller", true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 223,
                columnNumber: 9
            }, this),
            priority: 2
        });
    }
    if (hasHighViewers && isLowStock) {
        indicators.push({
            id: 'high-demand',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.8
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                        className: "w-4 h-4 text-yellow-400 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 248,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-yellow-400 font-medium",
                        children: "High Demand"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 249,
                        columnNumber: 11
                    }, this)
                ]
            }, "high-demand", true, {
                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                lineNumber: 242,
                columnNumber: 9
            }, this),
            priority: 6
        });
    }
    // Sort by priority and limit to top 3
    const sortedIndicators = indicators.sort((a, b)=>b.priority - a.priority).slice(0, 3);
    if (sortedIndicators.length === 0 || !isVisible) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                y: 10
            },
            animate: {
                opacity: 1,
                y: 0
            },
            exit: {
                opacity: 0,
                y: -10
            },
            className: `space-y-3 ${className}`,
            children: [
                sortedIndicators.map((indicator)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        layout: true,
                        className: "glass-card p-3 border border-border/30 bg-background/5 backdrop-blur-sm",
                        children: indicator.content
                    }, indicator.id, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 274,
                        columnNumber: 11
                    }, this)),
                isLowStock && hasHighViewers && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.9
                    },
                    animate: {
                        opacity: 1,
                        scale: 1
                    },
                    className: "glass-card p-3 border border-red-500/30 bg-red-500/5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                className: "w-4 h-4 text-red-400 animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 291,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-red-400",
                                children: "Almost sold out!"
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                                lineNumber: 292,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                        lineNumber: 290,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
                    lineNumber: 285,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
            lineNumber: 267,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
        lineNumber: 266,
        columnNumber: 5
    }, this);
}
_s(UrgencyIndicators, "yoea/jRMNDZBzUDpwF1Tf02OR3k=");
_c = UrgencyIndicators;
const UrgencyPresets = {
    lowStock: (stock)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UrgencyIndicators, {
            stock: stock,
            lowStockThreshold: 10,
            viewerCount: Math.floor(Math.random() * 20) + 5,
            showStock: true,
            showViewers: true
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
            lineNumber: 306,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0)),
    flashSale: (timeLeft, discountPercentage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UrgencyIndicators, {
            timeLeft: timeLeft,
            discount: {
                percentage: discountPercentage,
                endsAt: new Date(Date.now() + timeLeft * 1000).toISOString()
            },
            showCountdown: true,
            showViewers: true
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
            lineNumber: 316,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0)),
    popular: (viewerCount, salesCount)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UrgencyIndicators, {
            viewerCount: viewerCount,
            salesCount: salesCount,
            recentActivity: {
                purchases: Math.floor(Math.random() * 10) + 1,
                timeframe: "today"
            },
            showViewers: true,
            showSales: true
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
            lineNumber: 328,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0)),
    limitedEdition: (stock)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UrgencyIndicators, {
            stock: stock,
            lowStockThreshold: stock,
            viewerCount: Math.floor(Math.random() * 30) + 10,
            salesCount: Math.floor(Math.random() * 100) + 50,
            showStock: true,
            showViewers: true,
            showSales: true
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx",
            lineNumber: 341,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
};
var _c;
__turbopack_context__.k.register(_c, "UrgencyIndicators");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlogPostStructuredData",
    ()=>BlogPostStructuredData,
    "ProductStructuredData",
    ()=>ProductStructuredData,
    "ServiceStructuredData",
    ()=>ServiceStructuredData,
    "StructuredData",
    ()=>StructuredData,
    "WebPageStructuredData",
    ()=>WebPageStructuredData,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const StructuredData = ({ data })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(data)
        }
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = StructuredData;
const BlogPostStructuredData = ({ title, description, content, author, publishedDate, modifiedDate, image, url, category, tags })=>{
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "articleBody": content.substring(0, 500) + "...",
        "author": {
            "@type": "Person",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Astralis Agency",
            "logo": {
                "@type": "ImageObject",
                "url": "https://astralis.one/images/astralis-agency-logo.png"
            }
        },
        "datePublished": publishedDate,
        "dateModified": modifiedDate || publishedDate,
        "url": url,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        ...image && {
            "image": {
                "@type": "ImageObject",
                "url": image
            }
        },
        ...category && {
            "articleSection": category
        },
        ...tags && tags.length > 0 && {
            "keywords": tags.join(", ")
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StructuredData, {
        data: structuredData
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx",
        lineNumber: 81,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_c1 = BlogPostStructuredData;
const ProductStructuredData = ({ name, description, price, currency, image, url, brand, category, inStock = true, reviews, sku })=>{
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": description,
        "url": url,
        "brand": {
            "@type": "Brand",
            "name": brand || "Astralis Agency"
        },
        ...image && {
            "image": {
                "@type": "ImageObject",
                "url": image
            }
        },
        ...category && {
            "category": category
        },
        ...sku && {
            "sku": sku
        },
        "offers": {
            "@type": "Offer",
            "price": price.toString(),
            "priceCurrency": currency,
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "Astralis Agency"
            }
        },
        ...reviews && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": reviews.rating.toString(),
                "reviewCount": reviews.reviewCount.toString()
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StructuredData, {
        data: structuredData
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx",
        lineNumber: 156,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_c2 = ProductStructuredData;
const ServiceStructuredData = ({ name, description, provider, serviceType, areaServed, url, image })=>{
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": name,
        "description": description,
        "provider": {
            "@type": "Organization",
            "name": provider
        },
        "url": url,
        ...serviceType && {
            "serviceType": serviceType
        },
        ...areaServed && {
            "areaServed": areaServed
        },
        ...image && {
            "image": {
                "@type": "ImageObject",
                "url": image
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StructuredData, {
        data: structuredData
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx",
        lineNumber: 203,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_c3 = ServiceStructuredData;
const WebPageStructuredData = ({ name, description, url, type = 'WebPage', image })=>{
    const structuredData = {
        "@context": "https://schema.org",
        "@type": type,
        "name": name,
        "description": description,
        "url": url,
        "publisher": {
            "@type": "Organization",
            "name": "Astralis Agency",
            "logo": "https://astralis.one/images/astralis-agency-logo.png"
        },
        ...image && {
            "image": {
                "@type": "ImageObject",
                "url": image
            }
        },
        ...type === 'WebSite' && {
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://astralis.one/blog?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StructuredData, {
        data: structuredData
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx",
        lineNumber: 251,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_c4 = WebPageStructuredData;
const __TURBOPACK__default__export__ = StructuredData;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "StructuredData");
__turbopack_context__.k.register(_c1, "BlogPostStructuredData");
__turbopack_context__.k.register(_c2, "ProductStructuredData");
__turbopack_context__.k.register(_c3, "ServiceStructuredData");
__turbopack_context__.k.register(_c4, "WebPageStructuredData");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/separator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/thumbs-up.js [app-client] (ecmascript) <export default as ThumbsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/store/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/store/cart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$related$2d$products$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/marketplace/related-products.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$trust$2d$badges$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/marketplace/trust-badges.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$urgency$2d$indicators$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/marketplace/urgency-indicators.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$seo$2f$StructuredData$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/seo/StructuredData.tsx [app-client] (ecmascript)");
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
;
;
;
;
;
;
;
function ProductDetail() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const id = params.id;
    const [product, setProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quantity, setQuantity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [selectedImageIndex, setSelectedImageIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isWishlisted, setIsWishlisted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('overview');
    const [viewerCount, setViewerCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Math.floor(Math.random() * 50) + 10);
    const addItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])({
        "ProductDetail.useCart[addItem]": (state)=>state.addItem
    }["ProductDetail.useCart[addItem]"]);
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    // Simulate live viewer updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetail.useEffect": ()=>{
            const interval = setInterval({
                "ProductDetail.useEffect.interval": ()=>{
                    setViewerCount({
                        "ProductDetail.useEffect.interval": (prev)=>{
                            const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
                            ;
                            return Math.max(5, prev + change);
                        }
                    }["ProductDetail.useEffect.interval"]);
                }
            }["ProductDetail.useEffect.interval"], 5000);
            return ({
                "ProductDetail.useEffect": ()=>clearInterval(interval)
            })["ProductDetail.useEffect"];
        }
    }["ProductDetail.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetail.useEffect": ()=>{
            const fetchProduct = {
                "ProductDetail.useEffect.fetchProduct": async ()=>{
                    if (!id) return;
                    try {
                        setLoading(true);
                        const response = await fetch(`/api/marketplace/${id}`);
                        const data = await response.json();
                        if (data.status === 'success') {
                            setProduct(data.data);
                        } else {
                            setError('Product not found');
                        }
                    } catch (err) {
                        setError('Failed to load product details');
                        console.error('Error fetching product:', err);
                    } finally{
                        setLoading(false);
                    }
                }
            }["ProductDetail.useEffect.fetchProduct"];
            fetchProduct();
        }
    }["ProductDetail.useEffect"], [
        id
    ]);
    const handleAddToCart = ()=>{
        if (!product) return;
        addItem({
            id: product.id,
            name: product.title,
            price: Number(product.discountPrice || product.price),
            image: product.imageUrl,
            quantity
        });
        toast({
            title: "Added to cart",
            description: `${quantity} x ${product.title} added to your cart.`
        });
    };
    const handleBuyNow = ()=>{
        handleAddToCart();
        router.push('/checkout');
    };
    const handleWishlistToggle = ()=>{
        setIsWishlisted(!isWishlisted);
        toast({
            title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
            description: isWishlisted ? `${product?.title} removed from your wishlist.` : `${product?.title} added to your wishlist.`
        });
    };
    const handleShare = async ()=>{
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.title,
                    text: product?.description,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied",
                description: "Product link copied to clipboard."
            });
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-pulse space-y-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-8 bg-muted/10 rounded w-1/4 mb-6"
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                            lineNumber: 150,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-square bg-muted/10 rounded-lg"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 153,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-4 gap-2",
                                            children: [
                                                ...Array(4)
                                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "aspect-square bg-muted/10 rounded"
                                                }, i, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 154,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 152,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-6 bg-muted/10 rounded w-3/4"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 161,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-4 bg-muted/10 rounded w-1/2"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-20 bg-muted/10 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-12 bg-muted/10 rounded w-1/3"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-12 bg-muted/10 rounded"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 166,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-12 bg-muted/10 rounded"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 167,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 165,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 160,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                            lineNumber: 151,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                    lineNumber: 149,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                lineNumber: 148,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
            lineNumber: 147,
            columnNumber: 7
        }, this);
    }
    if (error || !product) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass-card p-12 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent",
                            children: "Product Not Found"
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                            lineNumber: 182,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground mb-6 text-lg",
                            children: error || 'The product you are looking for does not exist.'
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                            lineNumber: 185,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>router.push('/marketplace'),
                            className: "glass-button",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "w-4 h-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 189,
                                    columnNumber: 15
                                }, this),
                                "Back to Marketplace"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                            lineNumber: 188,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                    lineNumber: 181,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                lineNumber: 180,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
            lineNumber: 179,
            columnNumber: 7
        }, this);
    }
    const finalPrice = Number(product.discountPrice || product.price);
    const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
    const isLowStock = product.stock <= 10;
    const galleryImages = product.galleryImages && product.galleryImages.length > 0 ? [
        product.imageUrl,
        ...product.galleryImages
    ] : [
        product.imageUrl
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$seo$2f$StructuredData$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductStructuredData"], {
                name: product.title,
                description: product.description,
                price: product.discountPrice || product.price,
                currency: "USD",
                image: product.imageUrl,
                url: `https://astralis.one/marketplace/${product.slug}`,
                brand: "Astralis Agency",
                category: product.category?.name,
                inStock: product.stock > 0,
                sku: product.id,
                reviews: product.averageRating ? {
                    rating: product.averageRating,
                    reviewCount: product.reviewCount || 0
                } : undefined
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: 0.4
                        },
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "ghost",
                                onClick: ()=>router.push('/marketplace'),
                                className: "glass-button mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        className: "w-4 h-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this),
                                    "Back to Marketplace"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative aspect-square overflow-hidden rounded-lg glass-card border-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: galleryImages[selectedImageIndex],
                                                        alt: product.title,
                                                        className: "w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-4 left-4 flex flex-col gap-2",
                                                        children: [
                                                            product.featured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0",
                                                                children: "Featured"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 21
                                                            }, this),
                                                            hasDiscount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                className: "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0",
                                                                children: [
                                                                    "-",
                                                                    Math.round((Number(product.price) - finalPrice) / Number(product.price) * 100),
                                                                    "% OFF"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 263,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute bottom-4 right-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "glass-card px-3 py-2 flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-2 h-2 bg-green-400 rounded-full animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 272,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    className: "w-4 h-4 text-green-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 273,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium",
                                                                    children: viewerCount
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 274,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 271,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 15
                                            }, this),
                                            galleryImages.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-4 gap-2",
                                                children: galleryImages.slice(0, 4).map((image, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setSelectedImageIndex(index),
                                                        className: `aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary shadow-lg shadow-primary/25' : 'border-border/30 hover:border-border'}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: image,
                                                            alt: `${product.title} ${index + 1}`,
                                                            className: "w-full h-full object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 292,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, index, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                        lineNumber: 246,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "outline",
                                                                className: "glass-badge",
                                                                children: product.category.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 308,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        variant: "outline",
                                                                        size: "sm",
                                                                        onClick: handleWishlistToggle,
                                                                        className: `glass-button p-2 ${isWishlisted ? 'text-red-400 border-red-400/50' : ''}`,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                            className: `w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 312,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        variant: "outline",
                                                                        size: "sm",
                                                                        onClick: handleShare,
                                                                        className: "glass-button p-2",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 326,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 320,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 311,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent",
                                                        children: product.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                children: [
                                                                    [
                                                                        ...Array(5)
                                                                    ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                            className: `w-5 h-5 ${i < Math.floor(product.ratingAverage || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`
                                                                        }, i, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 338,
                                                                            columnNumber: 23
                                                                        }, this)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "ml-2 text-lg font-medium",
                                                                        children: product.ratingAverage || 4.5
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 347,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-muted-foreground",
                                                                        children: [
                                                                            "(",
                                                                            product.ratingCount || 23,
                                                                            " reviews)"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 350,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 336,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
                                                                orientation: "vertical",
                                                                className: "h-6"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 353,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-muted-foreground",
                                                                children: [
                                                                    Math.floor(Math.random() * 500) + 100,
                                                                    " sold"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 355,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 306,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$urgency$2d$indicators$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UrgencyIndicators"], {
                                                productId: product.id,
                                                stock: product.stock,
                                                viewerCount: viewerCount,
                                                salesCount: Math.floor(Math.random() * 100) + 50,
                                                recentActivity: {
                                                    purchases: Math.floor(Math.random() * 10) + 1,
                                                    timeframe: "today"
                                                },
                                                showViewers: true,
                                                showStock: isLowStock,
                                                showSales: true
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 362,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "glass-card p-6 space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-4xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent",
                                                                children: [
                                                                    "$",
                                                                    finalPrice.toFixed(2)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 379,
                                                                columnNumber: 19
                                                            }, this),
                                                            hasDiscount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xl text-muted-foreground line-through",
                                                                        children: [
                                                                            "$",
                                                                            Number(product.price).toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 384,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
                                                                        children: [
                                                                            "Save $",
                                                                            (Number(product.price) - finalPrice).toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 387,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 383,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$trust$2d$badges$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TrustBadges"], {
                                                        productType: product.itemType || 'PRODUCT',
                                                        features: {
                                                            hasSecurePayment: true,
                                                            hasInstantDelivery: (product.itemType || 'PRODUCT') === 'PRODUCT',
                                                            hasGuarantee: true,
                                                            isVerifiedSeller: true,
                                                            hasSupport: true
                                                        },
                                                        size: "sm",
                                                        layout: "horizontal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 377,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-semibold text-foreground",
                                                        children: "Description"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 411,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-muted-foreground leading-relaxed text-lg",
                                                        children: product.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 410,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                                className: "w-5 h-5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 420,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `font-medium ${product.stock > 0 ? isLowStock ? 'text-orange-400' : 'text-green-400' : 'text-red-400'}`,
                                                                children: product.stock > 0 ? `${product.stock} in stock${isLowStock ? ' - Limited quantity!' : ''}` : 'Out of stock'
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 421,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 419,
                                                        columnNumber: 17
                                                    }, this),
                                                    product.stock > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "quantity",
                                                                className: "font-medium text-foreground",
                                                                children: "Quantity:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 437,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        variant: "outline",
                                                                        size: "sm",
                                                                        onClick: ()=>setQuantity(Math.max(1, quantity - 1)),
                                                                        disabled: quantity <= 1,
                                                                        className: "glass-button p-2",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 448,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 441,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "w-12 text-center font-medium text-lg",
                                                                        children: quantity
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 450,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        variant: "outline",
                                                                        size: "sm",
                                                                        onClick: ()=>setQuantity(Math.min(product.stock, quantity + 1)),
                                                                        disabled: quantity >= product.stock,
                                                                        className: "glass-button p-2",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 458,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 451,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 440,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 436,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 418,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: [
                                                    product.stock > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                onClick: handleAddToCart,
                                                                size: "lg",
                                                                className: "glass-button-primary text-lg h-14",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                                        className: "w-5 h-5 mr-2"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 474,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    "Add to Cart"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 469,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                onClick: handleBuyNow,
                                                                variant: "outline",
                                                                size: "lg",
                                                                className: "glass-button text-lg h-14",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                        className: "w-5 h-5 mr-2"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 483,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    "Buy Now"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 477,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 468,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        disabled: true,
                                                        size: "lg",
                                                        className: "w-full h-14",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                                className: "w-5 h-5 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 489,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Out of Stock"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 488,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            className: "glass-button w-full",
                                                            onClick: ()=>{
                                                                // Open AI chat with product context
                                                                const chatButton = document.getElementById('ai-chat-trigger');
                                                                if (chatButton) {
                                                                    // Store product context in sessionStorage for the chat
                                                                    sessionStorage.setItem('chatContext', JSON.stringify({
                                                                        type: 'product_inquiry',
                                                                        product: {
                                                                            title: product.title,
                                                                            description: product.description,
                                                                            price: product.price,
                                                                            category: product.category?.name,
                                                                            id: product.id
                                                                        }
                                                                    }));
                                                                    chatButton.click();
                                                                }
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                                                    className: "w-4 h-4 mr-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 519,
                                                                    columnNumber: 21
                                                                }, this),
                                                                "Ask Question About This Product"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 496,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 495,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 466,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                                    value: activeTab,
                                    onValueChange: setActiveTab,
                                    className: "w-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                                            className: "glass-card grid w-full grid-cols-4 p-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                    value: "overview",
                                                    className: "data-[state=active]:bg-primary/20",
                                                    children: "Overview"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 531,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                    value: "features",
                                                    className: "data-[state=active]:bg-primary/20",
                                                    children: "Features"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 534,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                    value: "specs",
                                                    className: "data-[state=active]:bg-primary/20",
                                                    children: "Specifications"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 537,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                    value: "reviews",
                                                    className: "data-[state=active]:bg-primary/20",
                                                    children: "Reviews"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 540,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 530,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                            value: "overview",
                                            className: "mt-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "glass-card p-6 space-y-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xl font-semibold mb-3",
                                                                children: "Product Overview"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 548,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-muted-foreground leading-relaxed",
                                                                children: product.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 549,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 19
                                                    }, this),
                                                    product.features && product.features.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-semibold mb-3",
                                                                children: "Key Highlights"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 556,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                children: product.features.slice(0, 6).map((feature, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-start gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                                lineNumber: 560,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-foreground",
                                                                                children: feature
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                                lineNumber: 561,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, index, true, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 559,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 557,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 555,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 546,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 545,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                            value: "features",
                                            className: "mt-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "glass-card p-6",
                                                children: product.features && product.features.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-xl font-semibold",
                                                            children: "All Features"
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 574,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-1 gap-3",
                                                            children: product.features.map((feature, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-start gap-3 p-3 rounded-lg bg-muted/5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"], {
                                                                            className: "w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 578,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-foreground",
                                                                            children: feature
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 579,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, index, true, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 577,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 575,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 573,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-muted-foreground text-center py-8",
                                                    children: "No detailed features available for this product."
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 571,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 570,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                            value: "specs",
                                            className: "mt-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "glass-card p-6",
                                                children: product.specifications && product.specifications.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-xl font-semibold",
                                                            children: "Technical Specifications"
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 596,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-1 gap-3",
                                                            children: product.specifications.map((spec, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between p-3 rounded-lg bg-muted/5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-medium text-foreground",
                                                                            children: [
                                                                                "Specification ",
                                                                                index + 1
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 600,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-muted-foreground",
                                                                            children: spec
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                            lineNumber: 603,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, index, true, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 599,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 597,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 595,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-muted-foreground text-center py-8",
                                                    children: "No technical specifications available for this product."
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 609,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 593,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 592,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                            value: "reviews",
                                            className: "mt-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "glass-card p-6",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-xl font-semibold",
                                                                    children: "Customer Reviews"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 620,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: "outline",
                                                                    className: "glass-button",
                                                                    children: "Write a Review"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                    lineNumber: 621,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 619,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-muted-foreground",
                                                                children: "No reviews yet. Be the first to review this product!"
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 627,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 626,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                    lineNumber: 618,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 617,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 616,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 529,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 528,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-16",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$marketplace$2f$related$2d$products$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RelatedProducts"], {
                                    currentProductId: product.id,
                                    categorySlug: product.category.slug,
                                    tags: product.tags.map((tag)=>tag.slug),
                                    maxItems: 8
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 639,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 638,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "glass-card border-border/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-semibold text-foreground",
                                                children: "Seller Information"
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 651,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 650,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-4",
                                                children: [
                                                    product.seller.avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: product.seller.avatar,
                                                        alt: product.seller.name,
                                                        className: "w-16 h-16 rounded-full border-2 border-border"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-16 h-16 bg-gradient-to-br from-primary/20 to-blue/20 rounded-full flex items-center justify-center border-2 border-border",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl font-bold text-primary",
                                                            children: product.seller.name.charAt(0)
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                            lineNumber: 663,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 662,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-lg font-semibold text-foreground",
                                                                children: product.seller.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 669,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        className: "bg-green-500/20 text-green-400 border-green-500/30",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                                                className: "w-3 h-3 mr-1"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                                lineNumber: 672,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            "Verified Seller"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 671,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 675,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Member since 2020"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                        lineNumber: 676,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 670,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-muted-foreground",
                                                                children: [
                                                                    "Trusted by ",
                                                                    Math.floor(Math.random() * 5000) + 1000,
                                                                    "+ customers"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                                lineNumber: 678,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                        lineNumber: 668,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 654,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                            lineNumber: 653,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                    lineNumber: 649,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 648,
                                columnNumber: 11
                            }, this),
                            product.tags && product.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold mb-4 text-foreground",
                                        children: "Tags"
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                        lineNumber: 690,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: product.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "outline",
                                                className: "glass-badge",
                                                children: tag.name
                                            }, tag.id, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                                lineNumber: 693,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                        lineNumber: 691,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                                lineNumber: 689,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                    lineNumber: 226,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/app/marketplace/[id]/page.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(ProductDetail, "cJBDmxjhEXh+RXx7+11yDYZTfHo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$store$2f$cart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = ProductDetail;
var _c;
__turbopack_context__.k.register(_c, "ProductDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=projects_astralis-nextjs_src_29f6940c._.js.map