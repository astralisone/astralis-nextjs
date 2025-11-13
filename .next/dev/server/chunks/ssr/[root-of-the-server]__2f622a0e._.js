module.exports = [
"[externals]/framer-motion [external] (framer-motion, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("framer-motion");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/clsx [external] (clsx, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("clsx");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/tailwind-merge [external] (tailwind-merge, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("tailwind-merge");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/clsx [external] (clsx, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/tailwind-merge [external] (tailwind-merge, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$29$__["clsx"])(inputs));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/projects/astralis-nextjs/src/lib/utils/index.ts [ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(typeof date === 'string' ? new Date(date) : date);
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/hooks/useSEO.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "seoConfigs",
    ()=>seoConfigs,
    "useSEO",
    ()=>useSEO
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/router.js [ssr] (ecmascript)");
;
;
const useSEO = (config = {})=>{
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const currentUrl = `https://astralis.one${router.pathname}`;
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Update document title
        if (config.title) {
            document.title = config.title;
        }
        // Update meta tags
        const updateMetaTag = (selector, content)=>{
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                if (selector.includes('[name=')) {
                    element.setAttribute('name', selector.match(/\[name="([^"]*)"/)[1]);
                } else if (selector.includes('[property=')) {
                    element.setAttribute('property', selector.match(/\[property="([^"]*)"/)[1]);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };
        // Basic meta tags
        if (config.description) {
            updateMetaTag('meta[name="description"]', config.description);
            updateMetaTag('meta[property="og:description"]', config.description);
            updateMetaTag('meta[property="twitter:description"]', config.description);
        }
        if (config.keywords) {
            updateMetaTag('meta[name="keywords"]', config.keywords);
        }
        if (config.author) {
            updateMetaTag('meta[name="author"]', config.author);
        }
        // Open Graph tags
        updateMetaTag('meta[property="og:title"]', config.title || document.title);
        updateMetaTag('meta[property="og:url"]', config.url || currentUrl);
        updateMetaTag('meta[property="og:type"]', config.type || 'website');
        if (config.image) {
            updateMetaTag('meta[property="og:image"]', config.image);
            updateMetaTag('meta[property="twitter:image"]', config.image);
        }
        if (config.publishedTime) {
            updateMetaTag('meta[property="article:published_time"]', config.publishedTime);
        }
        if (config.modifiedTime) {
            updateMetaTag('meta[property="article:modified_time"]', config.modifiedTime);
        }
        // Twitter Card tags
        updateMetaTag('meta[property="twitter:title"]', config.title || document.title);
        updateMetaTag('meta[property="twitter:url"]', config.url || currentUrl);
        // Canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', config.url || currentUrl);
        // Robots meta
        if (config.noindex) {
            updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
        } else {
            updateMetaTag('meta[name="robots"]', 'index, follow');
        }
        // Structured Data
        if (config.structuredData) {
            let structuredDataScript = document.querySelector('#structured-data');
            if (!structuredDataScript) {
                structuredDataScript = document.createElement('script');
                structuredDataScript.id = 'structured-data';
                structuredDataScript.type = 'application/ld+json';
                document.head.appendChild(structuredDataScript);
            }
            structuredDataScript.textContent = JSON.stringify(config.structuredData);
        }
    }, [
        config,
        currentUrl
    ]);
    // Google Analytics page tracking
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-49DWRM7K4G', {
                page_path: router.asPath,
                page_title: document.title
            });
        }
    }, [
        router.asPath
    ]);
    // Track custom events
    const trackEvent = (eventName, parameters)=>{
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, {
                event_category: 'engagement',
                event_label: router.pathname,
                ...parameters
            });
        }
    };
    // Track page views
    const trackPageView = (path, title)=>{
        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-49DWRM7K4G', {
                page_path: path || router.pathname,
                page_title: title || document.title
            });
        }
    };
    return {
        trackEvent,
        trackPageView
    };
};
const seoConfigs = {
    home: {
        title: 'Astralis - Creative Agency & Digital Products | AI Solutions & Marketplace',
        description: 'Transform your business with Astralis creative agency. AI solutions, custom software development, and digital products marketplace. Expert consulting for modern enterprises.',
        keywords: 'creative agency, AI solutions, software development, digital products, business automation, custom applications',
        image: 'https://astralis.one/images/astralis-agency-logo.png',
        type: 'website'
    },
    marketplace: {
        title: 'Digital Products Marketplace | AI Tools & Software Solutions - Astralis',
        description: 'Discover premium digital products, AI tools, and software solutions. From custom applications to automation services. Find the perfect solution for your business.',
        keywords: 'digital products, AI tools, software marketplace, business automation, custom software, SaaS products',
        type: 'website'
    },
    blog: {
        title: 'Tech Blog | AI, Web Development & Business Insights - Astralis',
        description: 'Stay updated with the latest in AI, web development, and business technology. Expert insights, tutorials, and industry trends from Astralis team.',
        keywords: 'tech blog, AI insights, web development, business technology, tutorials, industry trends',
        type: 'website'
    },
    contact: {
        title: 'Contact Astralis | Get In Touch for AI Solutions & Custom Development',
        description: 'Ready to transform your business? Contact Astralis for AI solutions, custom development, and digital consulting. Let\'s discuss your project today.',
        keywords: 'contact astralis, AI consultation, custom development inquiry, business transformation, project discussion',
        type: 'website'
    }
};
const __TURBOPACK__default__export__ = useSEO;
}),
"[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SEOHead",
    ()=>SEOHead,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/navigation.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$hooks$2f$useSEO$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/hooks/useSEO.ts [ssr] (ecmascript)");
"use client";
;
;
;
;
const SEOHead = ({ title, description, keywords, image, url, type = 'website', author, publishedTime, modifiedTime, noindex = false, structuredData, children })=>{
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { trackEvent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$hooks$2f$useSEO$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useSEO"])();
    const currentUrl = url || `https://astralis.one${pathname}`;
    const fullTitle = title ? `${title} | Astralis Agency` : 'Astralis - Creative Agency & Digital Products | AI Solutions & Marketplace';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                children: fullTitle
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "description",
                content: description
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 46,
                columnNumber: 23
            }, ("TURBOPACK compile-time value", void 0)),
            keywords && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "keywords",
                content: keywords
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 47,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0)),
            author && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "author",
                content: author
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 48,
                columnNumber: 18
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                rel: "canonical",
                href: currentUrl
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: type
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:url",
                content: currentUrl
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:description",
                content: description
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 57,
                columnNumber: 23
            }, ("TURBOPACK compile-time value", void 0)),
            image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:image",
                content: image
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 58,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:site_name",
                content: "Astralis Agency"
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "twitter:card",
                content: "summary_large_image"
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "twitter:title",
                content: fullTitle
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "twitter:url",
                content: currentUrl
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "twitter:description",
                content: description
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 65,
                columnNumber: 23
            }, ("TURBOPACK compile-time value", void 0)),
            image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "twitter:image",
                content: image
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 66,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            publishedTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "article:published_time",
                content: publishedTime
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 69,
                columnNumber: 25
            }, ("TURBOPACK compile-time value", void 0)),
            modifiedTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "article:modified_time",
                content: modifiedTime
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 70,
                columnNumber: 24
            }, ("TURBOPACK compile-time value", void 0)),
            author && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "article:author",
                content: author
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 71,
                columnNumber: 18
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "robots",
                content: noindex ? 'noindex, nofollow' : 'index, follow'
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            structuredData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("script", {
                type: "application/ld+json",
                dangerouslySetInnerHTML: {
                    __html: JSON.stringify(structuredData)
                }
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = SEOHead;
}),
"[externals]/@radix-ui/react-slot [external] (@radix-ui/react-slot, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("@radix-ui/react-slot");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/class-variance-authority [external] (class-variance-authority, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("class-variance-authority");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/projects/astralis-nextjs/src/components/ui/button.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$slot__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$slot$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/@radix-ui/react-slot [external] (@radix-ui/react-slot, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$class$2d$variance$2d$authority__$5b$external$5d$__$28$class$2d$variance$2d$authority$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/class-variance-authority [external] (class-variance-authority, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$slot__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$slot$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$class$2d$variance$2d$authority__$5b$external$5d$__$28$class$2d$variance$2d$authority$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$slot__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$slot$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$class$2d$variance$2d$authority__$5b$external$5d$__$28$class$2d$variance$2d$authority$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$class$2d$variance$2d$authority__$5b$external$5d$__$28$class$2d$variance$2d$authority$2c$__esm_import$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
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
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["forwardRef"](({ className, variant, size, asChild = false, loading, loadingText, children, disabled, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$externals$5d2f40$radix$2d$ui$2f$react$2d$slot__$5b$external$5d$__$2840$radix$2d$ui$2f$react$2d$slot$2c$__esm_import$29$__["Slot"] : "button";
    const isDisabled = disabled || loading;
    const buttonContent = loading && loadingText ? loadingText : children;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        ...props,
        children: loading && !asChild ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mr-2",
                    role: "status",
                    "aria-hidden": "true",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
Button.displayName = "Button";
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ServiceWizardPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/framer-motion [external] (framer-motion, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/index.ts [ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/cn.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/arrow-right.js [ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/arrow-left.js [ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/sparkles.js [ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/users.js [ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/building-2.js [ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2d$increasing$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/chart-no-axes-column-increasing.js [ssr] (ecmascript) <export default as BarChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.js [ssr] (ecmascript) <export default as MousePointerClick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$seo$2f$SEOHead$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/seo/SEOHead.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/ui/button.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/router.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function ServiceWizardPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [currentStep, setCurrentStep] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({});
    const [showResults, setShowResults] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const wizardSteps = [
        {
            id: 0,
            title: "Business Challenge",
            description: "Let's identify your primary business challenge",
            question: "What's your biggest operational challenge right now?",
            options: [
                {
                    id: "customer-volume",
                    text: "Overwhelming customer inquiries",
                    description: "Too many support requests, long response times",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                    weight: {
                        'customer-service': 3,
                        'sales-pipeline': 1,
                        'content-generation': 1,
                        'data-analytics': 2
                    }
                },
                {
                    id: "sales-conversion",
                    text: "Low sales conversion rates",
                    description: "Struggling to convert leads into customers",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2d$increasing$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart$3e$__["BarChart"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 3,
                        'content-generation': 2,
                        'data-analytics': 2
                    }
                },
                {
                    id: "content-creation",
                    text: "Content production bottleneck",
                    description: "Can't create enough quality content fast enough",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 1,
                        'content-generation': 3,
                        'data-analytics': 1
                    }
                },
                {
                    id: "data-insights",
                    text: "Lack of actionable insights",
                    description: "Drowning in data but can't make sense of it",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2d$increasing$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart$3e$__["BarChart"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 2,
                        'content-generation': 1,
                        'data-analytics': 3
                    }
                }
            ]
        },
        {
            id: 1,
            title: "Business Size",
            description: "Help us understand your scale",
            question: "What's your business size?",
            options: [
                {
                    id: "startup",
                    text: "Startup (1-10 employees)",
                    description: "Early stage, rapid growth needed",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 2,
                        'content-generation': 2,
                        'data-analytics': 1
                    }
                },
                {
                    id: "small",
                    text: "Small Business (11-50 employees)",
                    description: "Established but looking to scale",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
                    weight: {
                        'customer-service': 2,
                        'sales-pipeline': 2,
                        'content-generation': 2,
                        'data-analytics': 2
                    }
                },
                {
                    id: "medium",
                    text: "Medium Business (51-200 employees)",
                    description: "Growing operations, need efficiency",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
                    weight: {
                        'customer-service': 3,
                        'sales-pipeline': 2,
                        'content-generation': 2,
                        'data-analytics': 3
                    }
                },
                {
                    id: "enterprise",
                    text: "Enterprise (200+ employees)",
                    description: "Large scale operations, complex needs",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
                    weight: {
                        'customer-service': 3,
                        'sales-pipeline': 3,
                        'content-generation': 3,
                        'data-analytics': 3
                    }
                }
            ]
        },
        {
            id: 2,
            title: "Priority Goals",
            description: "What matters most to your business?",
            question: "What's your top priority for the next 6 months?",
            options: [
                {
                    id: "customer-satisfaction",
                    text: "Improve customer satisfaction",
                    description: "Better support experience and faster resolutions",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                    weight: {
                        'customer-service': 3,
                        'sales-pipeline': 1,
                        'content-generation': 1,
                        'data-analytics': 2
                    }
                },
                {
                    id: "revenue-growth",
                    text: "Increase revenue",
                    description: "More leads, better conversion, higher sales",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2d$increasing$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart$3e$__["BarChart"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 3,
                        'content-generation': 2,
                        'data-analytics': 2
                    }
                },
                {
                    id: "operational-efficiency",
                    text: "Operational efficiency",
                    description: "Automate processes, reduce manual work",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
                    weight: {
                        'customer-service': 2,
                        'sales-pipeline': 2,
                        'content-generation': 3,
                        'data-analytics': 3
                    }
                },
                {
                    id: "market-expansion",
                    text: "Market expansion",
                    description: "Reach new audiences, scale marketing efforts",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 2,
                        'content-generation': 3,
                        'data-analytics': 2
                    }
                }
            ]
        },
        {
            id: 3,
            title: "Timeline",
            description: "When do you need to see results?",
            question: "What's your expected timeline for implementation?",
            options: [
                {
                    id: "urgent",
                    text: "ASAP (within 1 month)",
                    description: "Immediate need, quick wins required",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
                    weight: {
                        'customer-service': 2,
                        'sales-pipeline': 1,
                        'content-generation': 3,
                        'data-analytics': 1
                    }
                },
                {
                    id: "soon",
                    text: "Soon (1-3 months)",
                    description: "Important but can plan properly",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2d$increasing$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart$3e$__["BarChart"],
                    weight: {
                        'customer-service': 2,
                        'sales-pipeline': 2,
                        'content-generation': 2,
                        'data-analytics': 2
                    }
                },
                {
                    id: "planned",
                    text: "Planned (3-6 months)",
                    description: "Strategic initiative with proper timeline",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
                    weight: {
                        'customer-service': 2,
                        'sales-pipeline': 3,
                        'content-generation': 1,
                        'data-analytics': 3
                    }
                },
                {
                    id: "future",
                    text: "Future (6+ months)",
                    description: "Long-term planning and preparation",
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                    weight: {
                        'customer-service': 1,
                        'sales-pipeline': 3,
                        'content-generation': 1,
                        'data-analytics': 3
                    }
                }
            ]
        }
    ];
    const serviceRecommendations = {
        'customer-service': {
            service: 'customer-service',
            title: 'Customer Service Automation',
            description: 'AI-powered customer support that handles inquiries 24/7 while improving satisfaction scores.',
            score: 0,
            benefits: [
                '95% faster response times',
                '24/7 availability',
                '68% cost reduction',
                'Higher customer satisfaction'
            ],
            nextSteps: [
                'Book a personalized demo',
                'Free customer service audit',
                'Custom ROI analysis'
            ],
            route: '/services/customer-service'
        },
        'sales-pipeline': {
            service: 'sales-pipeline',
            title: 'Sales Pipeline Optimization',
            description: 'AI-driven sales automation that qualifies leads, nurtures prospects, and forecasts deals.',
            score: 0,
            benefits: [
                '278% higher conversion rates',
                '53% shorter sales cycles',
                '92% forecast accuracy',
                'Automated lead nurturing'
            ],
            nextSteps: [
                'View interactive sales demo',
                'Free pipeline assessment',
                'Custom conversion analysis'
            ],
            route: '/services/sales-pipeline'
        },
        'content-generation': {
            service: 'content-generation',
            title: 'Content Generation System',
            description: 'AI content creation that scales your marketing while maintaining your unique brand voice.',
            score: 0,
            benefits: [
                '300% more content output',
                '81% time savings',
                '70% cost reduction',
                'Consistent brand voice'
            ],
            nextSteps: [
                'See content samples',
                'Free brand voice analysis',
                'Custom content strategy'
            ],
            route: '/services/content-generation'
        },
        'data-analytics': {
            service: 'data-analytics',
            title: 'Data Analytics Dashboard',
            description: 'AI-powered business intelligence that turns your data into actionable insights.',
            score: 0,
            benefits: [
                '95% faster reporting',
                'Real-time insights',
                '91% forecast accuracy',
                'Automated trend detection'
            ],
            nextSteps: [
                'View live dashboard demo',
                'Free data assessment',
                'Custom analytics roadmap'
            ],
            route: '/services/data-analytics'
        }
    };
    const calculateRecommendations = ()=>{
        const scores = {
            'customer-service': 0,
            'sales-pipeline': 0,
            'content-generation': 0,
            'data-analytics': 0
        };
        // Calculate weighted scores based on answers
        wizardSteps.forEach((step)=>{
            const answer = answers[step.id];
            if (answer) {
                const option = step.options.find((opt)=>opt.id === answer);
                if (option) {
                    Object.entries(option.weight).forEach(([service, weight])=>{
                        scores[service] += weight;
                    });
                }
            }
        });
        // Create recommendations with scores
        return Object.entries(serviceRecommendations).map(([key, rec])=>({
                ...rec,
                score: scores[key]
            })).sort((a, b)=>b.score - a.score);
    };
    const handleAnswer = (answerId)=>{
        setAnswers((prev)=>({
                ...prev,
                [currentStep]: answerId
            }));
        if (currentStep < wizardSteps.length - 1) {
            setTimeout(()=>{
                setCurrentStep((prev)=>prev + 1);
            }, 300);
        } else {
            setTimeout(()=>{
                setShowResults(true);
            }, 300);
        }
    };
    const goBack = ()=>{
        if (currentStep > 0) {
            setCurrentStep((prev)=>prev - 1);
        }
    };
    const recommendations = showResults ? calculateRecommendations() : [];
    const topRecommendation = recommendations[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-neutral-900 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$seo$2f$SEOHead$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SEOHead"], {
                title: "Service Selection Wizard - Find Your Perfect AI Solution | Astralis",
                description: "Take our interactive quiz to discover which AI automation service is perfect for your business needs. Get personalized recommendations in minutes.",
                keywords: "AI service selection, business automation quiz, AI recommendation engine, service wizard"
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                lineNumber: 327,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "absolute inset-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                        lineNumber: 335,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-1/4 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                        lineNumber: 336,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]"
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                lineNumber: 334,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "relative z-10 container mx-auto px-4 py-16",
                children: !showResults ? /* Wizard Steps */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "max-w-4xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "mb-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-gray-400",
                                            children: [
                                                "Step ",
                                                currentStep + 1,
                                                " of ",
                                                wizardSteps.length
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 347,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-gray-400",
                                            children: [
                                                Math.round((currentStep + 1) / wizardSteps.length * 100),
                                                "% Complete"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 350,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 346,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "w-full bg-neutral-800 rounded-full h-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].div, {
                                        className: "h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full",
                                        initial: {
                                            width: 0
                                        },
                                        animate: {
                                            width: `${(currentStep + 1) / wizardSteps.length * 100}%`
                                        },
                                        transition: {
                                            duration: 0.5
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                        lineNumber: 355,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 354,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 345,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                x: 50
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            exit: {
                                opacity: 0,
                                x: -50
                            },
                            transition: {
                                duration: 0.3
                            },
                            className: "glass-elevated rounded-3xl p-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center mb-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "w-5 h-5 text-purple-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 375,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-purple-300",
                                                    children: wizardSteps[currentStep].title
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 376,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 374,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                            className: "text-3xl lg:text-4xl font-bold mb-4 leading-tight",
                                            children: wizardSteps[currentStep].question
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 381,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-xl text-gray-300 max-w-2xl mx-auto",
                                            children: wizardSteps[currentStep].description
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 385,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 373,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "grid md:grid-cols-2 gap-6",
                                    children: wizardSteps[currentStep].options.map((option, index)=>{
                                        const Icon = option.icon;
                                        const isSelected = answers[currentStep] === option.id;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].button, {
                                            initial: {
                                                opacity: 0,
                                                y: 20
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            transition: {
                                                duration: 0.3,
                                                delay: index * 0.1
                                            },
                                            onClick: ()=>handleAnswer(option.id),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("glass-card p-6 rounded-2xl border text-left transition-all duration-300", "hover:scale-102 hover:border-purple-500/50", isSelected ? "border-purple-500/50 bg-purple-500/10" : "border-white/20 hover:bg-white/5"),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-start gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("w-12 h-12 rounded-xl flex items-center justify-center border transition-colors", isSelected ? "border-purple-500/50 bg-purple-500/20" : "border-gray-600 bg-gray-800"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Icon, {
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("w-6 h-6", isSelected ? "text-purple-400" : "text-gray-400")
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("font-bold text-lg mb-2", isSelected ? "text-purple-300" : "text-white"),
                                                                children: option.text
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                lineNumber: 425,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-300 text-sm leading-relaxed",
                                                                children: option.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                lineNumber: 431,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 25
                                                    }, this),
                                                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                        className: "w-6 h-6 text-purple-400 flex-shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                        lineNumber: 437,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                lineNumber: 411,
                                                columnNumber: 23
                                            }, this)
                                        }, option.id, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 397,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 391,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between mt-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: goBack,
                                            disabled: currentStep === 0,
                                            variant: "outline",
                                            className: "border-white/20 hover:bg-white/10",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                    className: "w-5 h-5 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 19
                                                }, this),
                                                "Back"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 447,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-gray-400 text-sm",
                                            children: "Choose an option to continue"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 457,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 446,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, currentStep, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 365,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                    lineNumber: 343,
                    columnNumber: 11
                }, this) : /* Results */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 30
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        duration: 0.6
                    },
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-center mb-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "w-5 h-5 text-green-400"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 473,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium text-green-300",
                                            children: "Perfect Match Found!"
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 474,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 472,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                    className: "text-4xl lg:text-5xl font-bold mb-6 leading-tight",
                                    children: "Your Recommended Solution"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 479,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-xl text-gray-300 max-w-3xl mx-auto",
                                    children: "Based on your answers, here's the AI service that will have the biggest impact on your business"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 483,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 471,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "glass-elevated rounded-3xl p-12 mb-12 border border-purple-500/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-full mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "w-5 h-5 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 492,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-bold text-white",
                                                    children: "#1 Recommendation"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                            className: "text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent",
                                            children: topRecommendation?.title
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 498,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed",
                                            children: topRecommendation?.description
                                        }, void 0, false, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 502,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 490,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "grid md:grid-cols-2 gap-8 mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-bold text-white mb-4",
                                                    children: "Key Benefits"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 510,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "space-y-3",
                                                    children: topRecommendation?.benefits.map((benefit, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                    className: "w-5 h-5 text-green-400 flex-shrink-0"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                    lineNumber: 514,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-300",
                                                                    children: benefit
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                    lineNumber: 515,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, index, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                            lineNumber: 513,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 509,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-bold text-white mb-4",
                                                    children: "Next Steps"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 523,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "space-y-3",
                                                    children: topRecommendation?.nextSteps.map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    className: "w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-purple-400 font-bold",
                                                                        children: index + 1
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                        lineNumber: 528,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                    lineNumber: 527,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-300",
                                                                    children: step
                                                                }, void 0, false, {
                                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                                    lineNumber: 530,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, index, true, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                            lineNumber: 526,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 524,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 522,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 507,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col sm:flex-row gap-4 justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: ()=>router.push(topRecommendation?.route || '/'),
                                                size: "lg",
                                                className: "btn-primary text-lg px-8 py-4",
                                                children: [
                                                    "Explore This Solution ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                        className: "w-5 h-5 ml-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 43
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                lineNumber: 539,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: ()=>{
                                                    setShowResults(false);
                                                    setCurrentStep(0);
                                                    setAnswers({});
                                                },
                                                size: "lg",
                                                variant: "outline",
                                                className: "text-lg px-8 py-4 border-white/20 hover:bg-white/10",
                                                children: "Retake Quiz"
                                            }, void 0, false, {
                                                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                lineNumber: 546,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                        lineNumber: 538,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 537,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 489,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-center mb-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "text-2xl font-bold text-white mb-4",
                                    children: "All Recommendations"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 564,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-gray-300",
                                    children: "Ranked by relevance to your business needs"
                                }, void 0, false, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 565,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 563,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "grid lg:grid-cols-2 gap-6",
                            children: recommendations.map((rec, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        duration: 0.3,
                                        delay: index * 0.1
                                    },
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("glass-card p-6 rounded-2xl border transition-all duration-300 hover:scale-102", index === 0 ? "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5" : "border-white/20 hover:border-purple-500/30"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-4 mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("px-3 py-1 rounded-full text-sm font-bold", index === 0 ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-gray-700 text-gray-300"),
                                                    children: [
                                                        "#",
                                                        index + 1
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 583,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                            className: "font-bold text-white text-lg mb-2",
                                                            children: rec.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                            lineNumber: 592,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: "text-gray-300 text-sm",
                                                            children: rec.description
                                                        }, void 0, false, {
                                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                            lineNumber: 593,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 591,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 582,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: ()=>router.push(rec.route),
                                            variant: index === 0 ? "default" : "outline",
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full", index === 0 ? "btn-primary" : "border-white/20 hover:bg-white/10"),
                                            children: [
                                                "Learn More ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    className: "w-4 h-4 ml-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                                    lineNumber: 607,
                                                    columnNumber: 32
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                            lineNumber: 597,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, rec.service, true, {
                                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                                    lineNumber: 570,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                            lineNumber: 568,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                    lineNumber: 465,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
                lineNumber: 340,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/projects/astralis-nextjs/src/pages/services/wizard.tsx",
        lineNumber: 326,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2f622a0e._.js.map