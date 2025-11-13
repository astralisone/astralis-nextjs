module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const initialState = {
    theme: "system",
    setTheme: ()=>null
};
const ThemeProviderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(initialState);
function ThemeProvider({ children, defaultTheme = "dark", storageKey = "astralis-theme", ...props }) {
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Hydration-safe initialization
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, [
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!mounted) return;
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    }, [
        theme,
        mounted
    ]);
    const value = {
        theme,
        setTheme: (theme)=>{
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        }
    };
    // Prevent flash of unstyled content
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProviderContext.Provider, {
        ...props,
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
const useTheme = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeProviderContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
}),
"[project]/projects/astralis-nextjs/src/lib/config/payment.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Default test client ID from PayPal documentation
__turbopack_context__.s([
    "PAYPAL_CONFIG",
    ()=>PAYPAL_CONFIG,
    "STRIPE_CONFIG",
    ()=>STRIPE_CONFIG
]);
const TEST_CLIENT_ID = "test";
const PAYPAL_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || TEST_CLIENT_ID,
    currency: "USD",
    intent: "capture"
};
const STRIPE_CONFIG = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
};
}),
"[project]/projects/astralis-nextjs/src/lib/payment/paypal.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPayPalOptions",
    ()=>getPayPalOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$config$2f$payment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/config/payment.ts [app-ssr] (ecmascript)");
;
const getPayPalOptions = ()=>({
        clientId: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$config$2f$payment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAYPAL_CONFIG"].clientId,
        currency: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$config$2f$payment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAYPAL_CONFIG"].currency,
        intent: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$config$2f$payment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PAYPAL_CONFIG"].intent
    });
}),
"[project]/projects/astralis-nextjs/src/components/providers/payment/paypal-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PayPalProvider",
    ()=>PayPalProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$paypal$2f$react$2d$paypal$2d$js$2f$dist$2f$esm$2f$react$2d$paypal$2d$js$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/@paypal/react-paypal-js/dist/esm/react-paypal-js.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$payment$2f$paypal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/payment/paypal.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function PayPalProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f40$paypal$2f$react$2d$paypal$2d$js$2f$dist$2f$esm$2f$react$2d$paypal$2d$js$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PayPalScriptProvider"], {
        options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$payment$2f$paypal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPayPalOptions"])(),
        children: children
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/providers/payment/paypal-provider.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/projects/astralis-nextjs/src/components/providers/index.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next-auth/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$payment$2f$paypal$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/providers/payment/paypal-provider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function Providers({ children }) {
    return(// SessionProvider configured but not actively used
    // Using custom AuthProvider instead - disable auto-fetching to prevent console errors
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionProvider"], {
        refetchInterval: 0,
        refetchOnWindowFocus: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
            defaultTheme: "dark",
            storageKey: "astralis-theme",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$payment$2f$paypal$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PayPalProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/components/providers/index.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/components/providers/index.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/providers/index.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this));
}
}),
"[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxRuntime; //# sourceMappingURL=react-jsx-runtime.js.map
}),
"[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
"[project]/projects/astralis-nextjs/node_modules/next-auth/node_modules/@auth/core/errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Base error class for all Auth.js errors.
 * It's optimized to be printed in the server logs in a nicely formatted way
 * via the [`logger.error`](https://authjs.dev/reference/core#logger) option.
 * @noInheritDoc
 */ __turbopack_context__.s([
    "AccessDenied",
    ()=>AccessDenied,
    "AccountNotLinked",
    ()=>AccountNotLinked,
    "AdapterError",
    ()=>AdapterError,
    "AuthError",
    ()=>AuthError,
    "CallbackRouteError",
    ()=>CallbackRouteError,
    "CredentialsSignin",
    ()=>CredentialsSignin,
    "DuplicateConditionalUI",
    ()=>DuplicateConditionalUI,
    "EmailSignInError",
    ()=>EmailSignInError,
    "ErrorPageLoop",
    ()=>ErrorPageLoop,
    "EventError",
    ()=>EventError,
    "ExperimentalFeatureNotEnabled",
    ()=>ExperimentalFeatureNotEnabled,
    "InvalidCallbackUrl",
    ()=>InvalidCallbackUrl,
    "InvalidCheck",
    ()=>InvalidCheck,
    "InvalidEndpoints",
    ()=>InvalidEndpoints,
    "InvalidProvider",
    ()=>InvalidProvider,
    "JWTSessionError",
    ()=>JWTSessionError,
    "MissingAdapter",
    ()=>MissingAdapter,
    "MissingAdapterMethods",
    ()=>MissingAdapterMethods,
    "MissingAuthorize",
    ()=>MissingAuthorize,
    "MissingCSRF",
    ()=>MissingCSRF,
    "MissingSecret",
    ()=>MissingSecret,
    "MissingWebAuthnAutocomplete",
    ()=>MissingWebAuthnAutocomplete,
    "OAuthAccountNotLinked",
    ()=>OAuthAccountNotLinked,
    "OAuthCallbackError",
    ()=>OAuthCallbackError,
    "OAuthProfileParseError",
    ()=>OAuthProfileParseError,
    "OAuthSignInError",
    ()=>OAuthSignInError,
    "SessionTokenError",
    ()=>SessionTokenError,
    "SignInError",
    ()=>SignInError,
    "SignOutError",
    ()=>SignOutError,
    "UnknownAction",
    ()=>UnknownAction,
    "UnsupportedStrategy",
    ()=>UnsupportedStrategy,
    "UntrustedHost",
    ()=>UntrustedHost,
    "Verification",
    ()=>Verification,
    "WebAuthnVerificationError",
    ()=>WebAuthnVerificationError,
    "isClientError",
    ()=>isClientError
]);
class AuthError extends Error {
    /** @internal */ constructor(message, errorOptions){
        if (message instanceof Error) {
            super(undefined, {
                cause: {
                    err: message,
                    ...message.cause,
                    ...errorOptions
                }
            });
        } else if (typeof message === "string") {
            if (errorOptions instanceof Error) {
                errorOptions = {
                    err: errorOptions,
                    ...errorOptions.cause
                };
            }
            super(message, errorOptions);
        } else {
            super(undefined, message);
        }
        this.name = this.constructor.name;
        // @ts-expect-error https://github.com/microsoft/TypeScript/issues/3841
        this.type = this.constructor.type ?? "AuthError";
        // @ts-expect-error https://github.com/microsoft/TypeScript/issues/3841
        this.kind = this.constructor.kind ?? "error";
        Error.captureStackTrace?.(this, this.constructor);
        const url = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
        this.message += `${this.message ? ". " : ""}Read more at ${url}`;
    }
}
class SignInError extends AuthError {
}
/** @internal */ SignInError.kind = "signIn";
class AdapterError extends AuthError {
}
AdapterError.type = "AdapterError";
class AccessDenied extends AuthError {
}
AccessDenied.type = "AccessDenied";
class CallbackRouteError extends AuthError {
}
CallbackRouteError.type = "CallbackRouteError";
class ErrorPageLoop extends AuthError {
}
ErrorPageLoop.type = "ErrorPageLoop";
class EventError extends AuthError {
}
EventError.type = "EventError";
class InvalidCallbackUrl extends AuthError {
}
InvalidCallbackUrl.type = "InvalidCallbackUrl";
class CredentialsSignin extends SignInError {
    constructor(){
        super(...arguments);
        /**
         * The error code that is set in the `code` query parameter of the redirect URL.
         *
         *
         * ⚠ NOTE: This property is going to be included in the URL, so make sure it does not hint at sensitive errors.
         *
         * The full error is always logged on the server, if you need to debug.
         *
         * Generally, we don't recommend hinting specifically if the user had either a wrong username or password specifically,
         * try rather something like "Invalid credentials".
         */ this.code = "credentials";
    }
}
CredentialsSignin.type = "CredentialsSignin";
class InvalidEndpoints extends AuthError {
}
InvalidEndpoints.type = "InvalidEndpoints";
class InvalidCheck extends AuthError {
}
InvalidCheck.type = "InvalidCheck";
class JWTSessionError extends AuthError {
}
JWTSessionError.type = "JWTSessionError";
class MissingAdapter extends AuthError {
}
MissingAdapter.type = "MissingAdapter";
class MissingAdapterMethods extends AuthError {
}
MissingAdapterMethods.type = "MissingAdapterMethods";
class MissingAuthorize extends AuthError {
}
MissingAuthorize.type = "MissingAuthorize";
class MissingSecret extends AuthError {
}
MissingSecret.type = "MissingSecret";
class OAuthAccountNotLinked extends SignInError {
}
OAuthAccountNotLinked.type = "OAuthAccountNotLinked";
class OAuthCallbackError extends SignInError {
}
OAuthCallbackError.type = "OAuthCallbackError";
class OAuthProfileParseError extends AuthError {
}
OAuthProfileParseError.type = "OAuthProfileParseError";
class SessionTokenError extends AuthError {
}
SessionTokenError.type = "SessionTokenError";
class OAuthSignInError extends SignInError {
}
OAuthSignInError.type = "OAuthSignInError";
class EmailSignInError extends SignInError {
}
EmailSignInError.type = "EmailSignInError";
class SignOutError extends AuthError {
}
SignOutError.type = "SignOutError";
class UnknownAction extends AuthError {
}
UnknownAction.type = "UnknownAction";
class UnsupportedStrategy extends AuthError {
}
UnsupportedStrategy.type = "UnsupportedStrategy";
class InvalidProvider extends AuthError {
}
InvalidProvider.type = "InvalidProvider";
class UntrustedHost extends AuthError {
}
UntrustedHost.type = "UntrustedHost";
class Verification extends AuthError {
}
Verification.type = "Verification";
class MissingCSRF extends SignInError {
}
MissingCSRF.type = "MissingCSRF";
const clientErrors = new Set([
    "CredentialsSignin",
    "OAuthAccountNotLinked",
    "OAuthCallbackError",
    "AccessDenied",
    "Verification",
    "MissingCSRF",
    "AccountNotLinked",
    "WebAuthnVerificationError"
]);
function isClientError(error) {
    if (error instanceof AuthError) return clientErrors.has(error.type);
    return false;
}
class DuplicateConditionalUI extends AuthError {
}
DuplicateConditionalUI.type = "DuplicateConditionalUI";
class MissingWebAuthnAutocomplete extends AuthError {
}
MissingWebAuthnAutocomplete.type = "MissingWebAuthnAutocomplete";
class WebAuthnVerificationError extends AuthError {
}
WebAuthnVerificationError.type = "WebAuthnVerificationError";
class AccountNotLinked extends SignInError {
}
AccountNotLinked.type = "AccountNotLinked";
class ExperimentalFeatureNotEnabled extends AuthError {
}
ExperimentalFeatureNotEnabled.type = "ExperimentalFeatureNotEnabled";
}),
"[project]/projects/astralis-nextjs/node_modules/next-auth/lib/client.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClientSessionError",
    ()=>ClientSessionError,
    "apiBaseUrl",
    ()=>apiBaseUrl,
    "fetchData",
    ()=>fetchData,
    "now",
    ()=>now,
    "parseUrl",
    ()=>parseUrl,
    "useOnline",
    ()=>useOnline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next-auth/node_modules/@auth/core/errors.js [app-ssr] (ecmascript)");
"use client";
;
;
/** @todo */ class ClientFetchError extends __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthError"] {
}
class ClientSessionError extends __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthError"] {
}
async function fetchData(path, __NEXTAUTH, logger, req = {}) {
    const url = `${apiBaseUrl(__NEXTAUTH)}/${path}`;
    try {
        const options = {
            headers: {
                "Content-Type": "application/json",
                ...req?.headers?.cookie ? {
                    cookie: req.headers.cookie
                } : {}
            }
        };
        if (req?.body) {
            options.body = JSON.stringify(req.body);
            options.method = "POST";
        }
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) throw data;
        return data;
    } catch (error) {
        logger.error(new ClientFetchError(error.message, error));
        return null;
    }
}
function apiBaseUrl(__NEXTAUTH) {
    if ("TURBOPACK compile-time truthy", 1) {
        // Return absolute path when called server side
        return `${__NEXTAUTH.baseUrlServer}${__NEXTAUTH.basePathServer}`;
    }
    //TURBOPACK unreachable
    ;
}
function useOnline() {
    const [isOnline, setIsOnline] = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](typeof navigator !== "undefined" ? navigator.onLine : false);
    const setOnline = ()=>setIsOnline(true);
    const setOffline = ()=>setIsOnline(false);
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        window.addEventListener("online", setOnline);
        window.addEventListener("offline", setOffline);
        return ()=>{
            window.removeEventListener("online", setOnline);
            window.removeEventListener("offline", setOffline);
        };
    }, []);
    return isOnline;
}
function now() {
    return Math.floor(Date.now() / 1000);
}
function parseUrl(url) {
    const defaultUrl = new URL("http://localhost:3000/api/auth");
    if (url && !url.startsWith("http")) {
        url = `https://${url}`;
    }
    const _url = new URL(url || defaultUrl);
    const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname)// Remove trailing slash
    .replace(/\/$/, "");
    const base = `${_url.origin}${path}`;
    return {
        origin: _url.origin,
        host: _url.host,
        path,
        base,
        toString: ()=>base
    };
}
}),
"[project]/projects/astralis-nextjs/node_modules/next-auth/react.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 *
 * NextAuth.js is the official integration of Auth.js for Next.js applications. It supports both
 * [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components) and the
 * [Pages Router](https://nextjs.org/docs/pages). It includes methods for signing in, signing out, hooks, and a React
 * Context provider to wrap your application and make session data available anywhere.
 *
 * For use in [Server Actions](https://nextjs.org/docs/app/api-reference/functions/server-actions), check out [these methods](https://authjs.dev/guides/upgrade-to-v5#methods)
 *
 * @module react
 */ __turbopack_context__.s([
    "SessionContext",
    ()=>SessionContext,
    "SessionProvider",
    ()=>SessionProvider,
    "__NEXTAUTH",
    ()=>__NEXTAUTH,
    "getCsrfToken",
    ()=>getCsrfToken,
    "getProviders",
    ()=>getProviders,
    "getSession",
    ()=>getSession,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut,
    "useSession",
    ()=>useSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next-auth/lib/client.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const __NEXTAUTH = {
    baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUrl"])(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
    basePath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUrl"])(process.env.NEXTAUTH_URL).path,
    baseUrlServer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUrl"])(process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
    basePathServer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUrl"])(process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL).path,
    _lastSync: 0,
    _session: undefined,
    _getSession: ()=>{}
};
// https://github.com/nextauthjs/next-auth/pull/10762
let broadcastChannel = null;
function getNewBroadcastChannel() {
    if (typeof BroadcastChannel === "undefined") {
        return {
            postMessage: ()=>{},
            addEventListener: ()=>{},
            removeEventListener: ()=>{},
            name: "next-auth",
            onmessage: null,
            onmessageerror: null,
            close: ()=>{},
            dispatchEvent: ()=>false
        };
    }
    return new BroadcastChannel("next-auth");
}
function broadcast() {
    if (broadcastChannel === null) {
        broadcastChannel = getNewBroadcastChannel();
    }
    return broadcastChannel;
}
// TODO:
const logger = {
    debug: console.debug,
    error: console.error,
    warn: console.warn
};
const SessionContext = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"]?.(undefined);
function useSession(options) {
    if (!SessionContext) {
        throw new Error("React Context is unavailable in Server Components");
    }
    // @ts-expect-error Satisfy TS if branch on line below
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](SessionContext);
    if (!value && ("TURBOPACK compile-time value", "development") !== "production") {
        throw new Error("[next-auth]: `useSession` must be wrapped in a <SessionProvider />");
    }
    const { required, onUnauthenticated } = options ?? {};
    const requiredAndNotLoading = required && value.status === "unauthenticated";
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (requiredAndNotLoading) {
            const url = `${__NEXTAUTH.basePath}/signin?${new URLSearchParams({
                error: "SessionRequired",
                callbackUrl: window.location.href
            })}`;
            if (onUnauthenticated) onUnauthenticated();
            else window.location.href = url;
        }
    }, [
        requiredAndNotLoading,
        onUnauthenticated
    ]);
    if (requiredAndNotLoading) {
        return {
            data: value.data,
            update: value.update,
            status: "loading"
        };
    }
    return value;
}
async function getSession(params) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchData"])("session", __NEXTAUTH, logger, params);
    if (params?.broadcast ?? true) {
        // https://github.com/nextauthjs/next-auth/pull/11470
        getNewBroadcastChannel().postMessage({
            event: "session",
            data: {
                trigger: "getSession"
            }
        });
    }
    return session;
}
async function getCsrfToken() {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchData"])("csrf", __NEXTAUTH, logger);
    return response?.csrfToken ?? "";
}
async function getProviders() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchData"])("providers", __NEXTAUTH, logger);
}
async function signIn(provider, options, authorizationParams) {
    const { callbackUrl, ...rest } = options ?? {};
    const { redirect = true, redirectTo = callbackUrl ?? window.location.href, ...signInParams } = rest;
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiBaseUrl"])(__NEXTAUTH);
    const providers = await getProviders();
    if (!providers) {
        const url = `${baseUrl}/error`;
        window.location.href = url;
        return; // TODO: Return error if `redirect: false`
    }
    if (!provider || !providers[provider]) {
        const url = `${baseUrl}/signin?${new URLSearchParams({
            callbackUrl: redirectTo
        })}`;
        window.location.href = url;
        return; // TODO: Return error if `redirect: false`
    }
    const providerType = providers[provider].type;
    if (providerType === "webauthn") {
        // TODO: Add docs link with explanation
        throw new TypeError([
            `Provider id "${provider}" refers to a WebAuthn provider.`,
            'Please use `import { signIn } from "next-auth/webauthn"` instead.'
        ].join("\n"));
    }
    const signInUrl = `${baseUrl}/${providerType === "credentials" ? "callback" : "signin"}/${provider}`;
    const csrfToken = await getCsrfToken();
    const res = await fetch(`${signInUrl}?${new URLSearchParams(authorizationParams)}`, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Auth-Return-Redirect": "1"
        },
        body: new URLSearchParams({
            ...signInParams,
            csrfToken,
            callbackUrl: redirectTo
        })
    });
    const data = await res.json();
    if (redirect) {
        const url = data.url ?? redirectTo;
        window.location.href = url;
        // If url contains a hash, the browser does not reload the page. We reload manually
        if (url.includes("#")) window.location.reload();
        return;
    }
    const error = new URL(data.url).searchParams.get("error") ?? undefined;
    const code = new URL(data.url).searchParams.get("code") ?? undefined;
    if (res.ok) {
        await __NEXTAUTH._getSession({
            event: "storage"
        });
    }
    return {
        error,
        code,
        status: res.status,
        ok: res.ok,
        url: error ? null : data.url
    };
}
async function signOut(options) {
    const { redirect = true, redirectTo = options?.callbackUrl ?? window.location.href } = options ?? {};
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiBaseUrl"])(__NEXTAUTH);
    const csrfToken = await getCsrfToken();
    const res = await fetch(`${baseUrl}/signout`, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Auth-Return-Redirect": "1"
        },
        body: new URLSearchParams({
            csrfToken,
            callbackUrl: redirectTo
        })
    });
    const data = await res.json();
    broadcast().postMessage({
        event: "session",
        data: {
            trigger: "signout"
        }
    });
    if (redirect) {
        const url = data.url ?? redirectTo;
        window.location.href = url;
        // If url contains a hash, the browser does not reload the page. We reload manually
        if (url.includes("#")) window.location.reload();
        return;
    }
    await __NEXTAUTH._getSession({
        event: "storage"
    });
    return data;
}
function SessionProvider(props) {
    if (!SessionContext) {
        throw new Error("React Context is unavailable in Server Components");
    }
    const { children, basePath, refetchInterval, refetchWhenOffline } = props;
    if (basePath) __NEXTAUTH.basePath = basePath;
    /**
     * If session was `null`, there was an attempt to fetch it,
     * but it failed, but we still treat it as a valid initial value.
     */ const hasInitialSession = props.session !== undefined;
    /** If session was passed, initialize as already synced */ __NEXTAUTH._lastSync = hasInitialSession ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["now"])() : 0;
    const [session, setSession] = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](()=>{
        if (hasInitialSession) __NEXTAUTH._session = props.session;
        return props.session;
    });
    /** If session was passed, initialize as not loading */ const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](!hasInitialSession);
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        __NEXTAUTH._getSession = async ({ event } = {})=>{
            try {
                const storageEvent = event === "storage";
                // We should always update if we don't have a client session yet
                // or if there are events from other tabs/windows
                if (storageEvent || __NEXTAUTH._session === undefined) {
                    __NEXTAUTH._lastSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["now"])();
                    __NEXTAUTH._session = await getSession({
                        broadcast: !storageEvent
                    });
                    setSession(__NEXTAUTH._session);
                    return;
                }
                if (// If there is no time defined for when a session should be considered
                // stale, then it's okay to use the value we have until an event is
                // triggered which updates it
                !event || // If the client doesn't have a session then we don't need to call
                // the server to check if it does (if they have signed in via another
                // tab or window that will come through as a "stroage" event
                // event anyway)
                __NEXTAUTH._session === null || // Bail out early if the client session is not stale yet
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["now"])() < __NEXTAUTH._lastSync) {
                    return;
                }
                // An event or session staleness occurred, update the client session.
                __NEXTAUTH._lastSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["now"])();
                __NEXTAUTH._session = await getSession();
                setSession(__NEXTAUTH._session);
            } catch (error) {
                logger.error(new __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClientSessionError"](error.message, error));
            } finally{
                setLoading(false);
            }
        };
        __NEXTAUTH._getSession();
        return ()=>{
            __NEXTAUTH._lastSync = 0;
            __NEXTAUTH._session = undefined;
            __NEXTAUTH._getSession = ()=>{};
        };
    }, []);
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const handle = ()=>__NEXTAUTH._getSession({
                event: "storage"
            });
        // Listen for storage events and update session if event fired from
        // another window (but suppress firing another event to avoid a loop)
        // Fetch new session data but tell it to not to fire another event to
        // avoid an infinite loop.
        // Note: We could pass session data through and do something like
        // `setData(message.data)` but that can cause problems depending
        // on how the session object is being used in the client; it is
        // more robust to have each window/tab fetch it's own copy of the
        // session object rather than share it across instances.
        broadcast().addEventListener("message", handle);
        return ()=>broadcast().removeEventListener("message", handle);
    }, []);
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const { refetchOnWindowFocus = true } = props;
        // Listen for when the page is visible, if the user switches tabs
        // and makes our tab visible again, re-fetch the session, but only if
        // this feature is not disabled.
        const visibilityHandler = ()=>{
            if (refetchOnWindowFocus && document.visibilityState === "visible") __NEXTAUTH._getSession({
                event: "visibilitychange"
            });
        };
        document.addEventListener("visibilitychange", visibilityHandler, false);
        return ()=>document.removeEventListener("visibilitychange", visibilityHandler, false);
    }, [
        props.refetchOnWindowFocus
    ]);
    const isOnline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnline"])();
    // TODO: Flip this behavior in next major version
    const shouldRefetch = refetchWhenOffline !== false || isOnline;
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (refetchInterval && shouldRefetch) {
            const refetchIntervalTimer = setInterval(()=>{
                if (__NEXTAUTH._session) {
                    __NEXTAUTH._getSession({
                        event: "poll"
                    });
                }
            }, refetchInterval * 1000);
            return ()=>clearInterval(refetchIntervalTimer);
        }
    }, [
        refetchInterval,
        shouldRefetch
    ]);
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
            data: session,
            status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
            async update (data) {
                if (loading) return;
                setLoading(true);
                const newSession = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$lib$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchData"])("session", __NEXTAUTH, logger, typeof data === "undefined" ? undefined : {
                    body: {
                        csrfToken: await getCsrfToken(),
                        data
                    }
                });
                setLoading(false);
                if (newSession) {
                    setSession(newSession);
                    broadcast().postMessage({
                        event: "session",
                        data: {
                            trigger: "getSession"
                        }
                    });
                }
                return newSession;
            }
        }), [
        session,
        loading
    ]);
    return(// @ts-expect-error
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SessionContext.Provider, {
        value: value,
        children: children
    }));
}
}),
"[project]/projects/astralis-nextjs/node_modules/@paypal/react-paypal-js/dist/esm/react-paypal-js.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*!
 * react-paypal-js v8.9.2 (2025-10-02T20:17:55.069Z)
 * Copyright 2020-present, PayPal, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __turbopack_context__.s([
    "BraintreePayPalButtons",
    ()=>BraintreePayPalButtons,
    "DISPATCH_ACTION",
    ()=>DISPATCH_ACTION,
    "FUNDING",
    ()=>FUNDING,
    "PAYPAL_HOSTED_FIELDS_TYPES",
    ()=>PAYPAL_HOSTED_FIELDS_TYPES,
    "PayPalButtons",
    ()=>PayPalButtons,
    "PayPalCVVField",
    ()=>PayPalCVVField,
    "PayPalCardFieldsContext",
    ()=>PayPalCardFieldsContext,
    "PayPalCardFieldsForm",
    ()=>PayPalCardFieldsForm,
    "PayPalCardFieldsProvider",
    ()=>PayPalCardFieldsProvider,
    "PayPalExpiryField",
    ()=>PayPalExpiryField,
    "PayPalHostedField",
    ()=>PayPalHostedField,
    "PayPalHostedFieldsProvider",
    ()=>PayPalHostedFieldsProvider,
    "PayPalMarks",
    ()=>PayPalMarks,
    "PayPalMessages",
    ()=>PayPalMessages,
    "PayPalNameField",
    ()=>PayPalNameField,
    "PayPalNumberField",
    ()=>PayPalNumberField,
    "PayPalScriptProvider",
    ()=>PayPalScriptProvider,
    "SCRIPT_LOADING_STATE",
    ()=>SCRIPT_LOADING_STATE,
    "ScriptContext",
    ()=>ScriptContext,
    "destroySDKScript",
    ()=>destroySDKScript,
    "getScriptID",
    ()=>getScriptID,
    "scriptReducer",
    ()=>scriptReducer,
    "usePayPalCardFields",
    ()=>usePayPalCardFields,
    "usePayPalHostedFields",
    ()=>usePayPalHostedFields,
    "usePayPalScriptReducer",
    ()=>usePayPalScriptReducer,
    "useScriptProviderContext",
    ()=>useScriptProviderContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
/**
 * Enum for the SDK script resolve status,
 *
 * @enum {string}
 */ var SCRIPT_LOADING_STATE;
(function(SCRIPT_LOADING_STATE) {
    SCRIPT_LOADING_STATE["INITIAL"] = "initial";
    SCRIPT_LOADING_STATE["PENDING"] = "pending";
    SCRIPT_LOADING_STATE["REJECTED"] = "rejected";
    SCRIPT_LOADING_STATE["RESOLVED"] = "resolved";
})(SCRIPT_LOADING_STATE || (SCRIPT_LOADING_STATE = {}));
/**
 * Enum for the PayPalScriptProvider context dispatch actions
 *
 * @enum {string}
 */ var DISPATCH_ACTION;
(function(DISPATCH_ACTION) {
    DISPATCH_ACTION["LOADING_STATUS"] = "setLoadingStatus";
    DISPATCH_ACTION["RESET_OPTIONS"] = "resetOptions";
    DISPATCH_ACTION["SET_BRAINTREE_INSTANCE"] = "braintreeInstance";
})(DISPATCH_ACTION || (DISPATCH_ACTION = {}));
/**
 * Enum for all the available hosted fields
 *
 * @enum {string}
 */ var PAYPAL_HOSTED_FIELDS_TYPES;
(function(PAYPAL_HOSTED_FIELDS_TYPES) {
    PAYPAL_HOSTED_FIELDS_TYPES["NUMBER"] = "number";
    PAYPAL_HOSTED_FIELDS_TYPES["CVV"] = "cvv";
    PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_DATE"] = "expirationDate";
    PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_MONTH"] = "expirationMonth";
    PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_YEAR"] = "expirationYear";
    PAYPAL_HOSTED_FIELDS_TYPES["POSTAL_CODE"] = "postalCode";
})(PAYPAL_HOSTED_FIELDS_TYPES || (PAYPAL_HOSTED_FIELDS_TYPES = {}));
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __rest$1(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
/*********************************************
 * Common reference to the script identifier *
 *********************************************/ // keep this script id value in kebab-case format
var SCRIPT_ID = "data-react-paypal-script-id";
var SDK_SETTINGS = {
    DATA_CLIENT_TOKEN: "dataClientToken",
    DATA_JS_SDK_LIBRARY: "dataJsSdkLibrary",
    DATA_LIBRARY_VALUE: "react-paypal-js",
    DATA_NAMESPACE: "dataNamespace",
    DATA_SDK_INTEGRATION_SOURCE: "dataSdkIntegrationSource",
    DATA_USER_ID_TOKEN: "dataUserIdToken"
};
var LOAD_SCRIPT_ERROR = "Failed to load the PayPal JS SDK script.";
/****************************
 * Braintree error messages *
 ****************************/ var EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE = "Invalid authorization data. Use dataClientToken or dataUserIdToken to authorize.";
var braintreeVersion = "3.117.0";
var BRAINTREE_SOURCE = "https://js.braintreegateway.com/web/".concat(braintreeVersion, "/js/client.min.js");
var BRAINTREE_PAYPAL_CHECKOUT_SOURCE = "https://js.braintreegateway.com/web/".concat(braintreeVersion, "/js/paypal-checkout.min.js");
/*********************
 * PayPal namespaces *
 *********************/ var DEFAULT_PAYPAL_NAMESPACE = "paypal";
var DEFAULT_BRAINTREE_NAMESPACE = "braintree";
/*****************
 * Hosted Fields *
 *****************/ var HOSTED_FIELDS_CHILDREN_ERROR = "To use HostedFields you must use it with at least 3 children with types: [number, cvv, expirationDate] includes";
var HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR = "Cannot use duplicate HostedFields as children";
/*******************
 * Script Provider *
 *******************/ var SCRIPT_PROVIDER_REDUCER_ERROR = "usePayPalScriptReducer must be used within a PayPalScriptProvider";
var CARD_FIELDS_DUPLICATE_CHILDREN_ERROR = "Cannot use duplicate CardFields as children";
var CARD_FIELDS_CONTEXT_ERROR = "Individual CardFields must be rendered inside the PayPalCardFieldsProvider";
/**
 * Get the namespace from the window in the browser
 * this is useful to get the paypal object from window
 * after load PayPal SDK script
 *
 * @param namespace the name space to return
 * @returns the namespace if exists or undefined otherwise
 */ function getPayPalWindowNamespace$1(namespace) {
    if (namespace === void 0) {
        namespace = DEFAULT_PAYPAL_NAMESPACE;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return window[namespace];
}
/**
 * Get a namespace from the window in the browser
 * this is useful to get the braintree from window
 * after load Braintree script
 *
 * @param namespace the name space to return
 * @returns the namespace if exists or undefined otherwise
 */ function getBraintreeWindowNamespace(namespace) {
    if (namespace === void 0) {
        namespace = DEFAULT_BRAINTREE_NAMESPACE;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return window[namespace];
}
/**
 * Creates a string hash code based on the string argument
 *
 * @param str the source input string to hash
 * @returns string hash code
 */ function hashStr(str) {
    var hash = "";
    for(var i = 0; i < str.length; i++){
        var total = str[i].charCodeAt(0) * i;
        if (str[i + 1]) {
            total += str[i + 1].charCodeAt(0) * (i - 1);
        }
        hash += String.fromCharCode(97 + Math.abs(total) % 26);
    }
    return hash;
}
function generateErrorMessage(_a) {
    var reactComponentName = _a.reactComponentName, sdkComponentKey = _a.sdkComponentKey, _b = _a.sdkRequestedComponents, sdkRequestedComponents = _b === void 0 ? "" : _b, _c = _a.sdkDataNamespace, sdkDataNamespace = _c === void 0 ? DEFAULT_PAYPAL_NAMESPACE : _c;
    var requiredOptionCapitalized = sdkComponentKey.charAt(0).toUpperCase().concat(sdkComponentKey.substring(1));
    var errorMessage = "Unable to render <".concat(reactComponentName, " /> because window.").concat(sdkDataNamespace, ".").concat(requiredOptionCapitalized, " is undefined.");
    // The JS SDK only loads the buttons component by default.
    // All other components like messages and marks must be requested using the "components" query parameter
    var requestedComponents = typeof sdkRequestedComponents === "string" ? sdkRequestedComponents : sdkRequestedComponents.join(",");
    if (!requestedComponents.includes(sdkComponentKey)) {
        var expectedComponents = [
            requestedComponents,
            sdkComponentKey
        ].filter(Boolean).join();
        errorMessage += "\nTo fix the issue, add '".concat(sdkComponentKey, "' to the list of components passed to the parent PayPalScriptProvider:") + "\n`<PayPalScriptProvider options={{ components: '".concat(expectedComponents, "'}}>`.");
    }
    return errorMessage;
}
/**
 * Generate a new random identifier for react-paypal-js
 *
 * @returns the {@code string} containing the random library name
 */ function getScriptID(options) {
    // exclude the data-react-paypal-script-id value from the options hash
    var _a = options, _b = SCRIPT_ID;
    _a[_b];
    var paypalScriptOptions = __rest$1(_a, [
        _b + ""
    ]);
    return "react-paypal-js-".concat(hashStr(JSON.stringify(paypalScriptOptions)));
}
/**
 * Destroy the PayPal SDK from the document page
 *
 * @param reactPayPalScriptID the script identifier
 */ function destroySDKScript(reactPayPalScriptID) {
    var scriptNode = self.document.querySelector("script[".concat(SCRIPT_ID, "=\"").concat(reactPayPalScriptID, "\"]"));
    if (scriptNode === null || scriptNode === void 0 ? void 0 : scriptNode.parentNode) {
        scriptNode.parentNode.removeChild(scriptNode);
    }
}
/**
 * Reducer function to handle complex state changes on the context
 *
 * @param state  the current state on the context object
 * @param action the action to be executed on the previous state
 * @returns a the same state if the action wasn't found, or a new state otherwise
 */ function scriptReducer(state, action) {
    var _a, _b;
    switch(action.type){
        case DISPATCH_ACTION.LOADING_STATUS:
            if (typeof action.value === "object") {
                return __assign(__assign({}, state), {
                    loadingStatus: action.value.state,
                    loadingStatusErrorMessage: action.value.message
                });
            }
            return __assign(__assign({}, state), {
                loadingStatus: action.value
            });
        case DISPATCH_ACTION.RESET_OPTIONS:
            // destroy existing script to make sure only one script loads at a time
            destroySDKScript(state.options[SCRIPT_ID]);
            return __assign(__assign({}, state), {
                loadingStatus: SCRIPT_LOADING_STATE.PENDING,
                options: __assign(__assign((_a = {}, _a[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _a), action.value), (_b = {}, _b[SCRIPT_ID] = "".concat(getScriptID(action.value)), _b))
            });
        case DISPATCH_ACTION.SET_BRAINTREE_INSTANCE:
            return __assign(__assign({}, state), {
                braintreePayPalCheckoutInstance: action.value
            });
        default:
            {
                return state;
            }
    }
}
// Create the React context to use in the script provider component
var ScriptContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
/**
 * Check if the context is valid and ready to dispatch actions.
 *
 * @param scriptContext the result of connecting to the context provider
 * @returns strict context avoiding null values in the type
 */ function validateReducer(scriptContext) {
    if (typeof (scriptContext === null || scriptContext === void 0 ? void 0 : scriptContext.dispatch) === "function" && scriptContext.dispatch.length !== 0) {
        return scriptContext;
    }
    throw new Error(SCRIPT_PROVIDER_REDUCER_ERROR);
}
/**
 * Check if the dataClientToken or the dataUserIdToken are
 * set in the options of the context.
 * @type dataClientToken is use to pass a client token
 * @type dataUserIdToken is use to pass a client tokenization key
 *
 * @param scriptContext the result of connecting to the context provider
 * @throws an {@link Error} if both dataClientToken and the dataUserIdToken keys are null or undefined
 * @returns strict context if one of the keys are defined
 */ var validateBraintreeAuthorizationData = function(scriptContext) {
    var _a, _b;
    if (!((_a = scriptContext === null || scriptContext === void 0 ? void 0 : scriptContext.options) === null || _a === void 0 ? void 0 : _a[SDK_SETTINGS.DATA_CLIENT_TOKEN]) && !((_b = scriptContext === null || scriptContext === void 0 ? void 0 : scriptContext.options) === null || _b === void 0 ? void 0 : _b[SDK_SETTINGS.DATA_USER_ID_TOKEN])) {
        throw new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE);
    }
    return scriptContext;
};
/**
 * Custom hook to get access to the Script context and
 * dispatch actions to modify the state on the {@link ScriptProvider} component
 *
 * @returns a tuple containing the state of the context and
 * a dispatch function to modify the state
 */ function usePayPalScriptReducer() {
    var scriptContext = validateReducer((0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ScriptContext));
    var derivedStatusContext = __assign(__assign({}, scriptContext), {
        isInitial: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
        isPending: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.PENDING,
        isResolved: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
        isRejected: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.REJECTED
    });
    return [
        derivedStatusContext,
        scriptContext.dispatch
    ];
}
/**
 * Custom hook to get access to the ScriptProvider context
 *
 * @returns the latest state of the context
 */ function useScriptProviderContext() {
    var scriptContext = validateBraintreeAuthorizationData(validateReducer((0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ScriptContext)));
    return [
        scriptContext,
        scriptContext.dispatch
    ];
}
// Create the React context to use in the PayPal hosted fields provider
var PayPalHostedFieldsContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({});
/**
 * Custom hook to get access to the PayPal Hosted Fields instance.
 * The instance represent the returned object after the render process
 * With this object a user can submit the fields and dynamically modify the cards
 *
 * @returns the hosted fields instance if is available in the component
 */ function usePayPalHostedFields() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PayPalHostedFieldsContext);
}
function useProxyProps(props) {
    var proxyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Proxy({}, {
        get: function(target, prop, receiver) {
            /**
       *
       * If target[prop] is a function, return a function that accesses
       * this function off the target object. We can mutate the target with
       * new copies of this function without having to re-render the
       * SDK components to pass new callbacks.
       *
       * */ if (typeof target[prop] === "function") {
                return function() {
                    var args = [];
                    for(var _i = 0; _i < arguments.length; _i++){
                        args[_i] = arguments[_i];
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    return target[prop].apply(target, args);
                };
            }
            return Reflect.get(target, prop, receiver);
        }
    }));
    proxyRef.current = Object.assign(proxyRef.current, props);
    return proxyRef.current;
}
/**
This `<PayPalButtons />` component supports rendering [buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons) for PayPal, Venmo, and alternative payment methods.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/ var PayPalButtons = function(_a) {
    var _b;
    var _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, children = _a.children, _e = _a.forceReRender, forceReRender = _e === void 0 ? [] : _e, buttonProps = __rest$1(_a, [
        "className",
        "disabled",
        "children",
        "forceReRender"
    ]);
    var isDisabledStyle = disabled ? {
        opacity: 0.38
    } : {};
    var classNames = "".concat(className, " ").concat(disabled ? "paypal-buttons-disabled" : "").trim();
    var buttonsContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var buttons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var proxyProps = useProxyProps(buttonProps);
    var _f = usePayPalScriptReducer()[0], isResolved = _f.isResolved, options = _f.options;
    var _g = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), initActions = _g[0], setInitActions = _g[1];
    var _h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true), isEligible = _h[0], setIsEligible = _h[1];
    var _j = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setErrorState = _j[1];
    function closeButtonsComponent() {
        if (buttons.current !== null) {
            buttons.current.close().catch(function() {
            // ignore errors when closing the component
            });
        }
    }
    if ((_b = buttons.current) === null || _b === void 0 ? void 0 : _b.updateProps) {
        buttons.current.updateProps({
            message: buttonProps.message
        });
    }
    // useEffect hook for rendering the buttons
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return closeButtonsComponent;
        }
        var paypalWindowNamespace = getPayPalWindowNamespace$1(options.dataNamespace);
        // verify dependency on window object
        if (paypalWindowNamespace === undefined || paypalWindowNamespace.Buttons === undefined) {
            setErrorState(function() {
                throw new Error(generateErrorMessage({
                    reactComponentName: PayPalButtons.displayName,
                    sdkComponentKey: "buttons",
                    sdkRequestedComponents: options.components,
                    sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
                }));
            });
            return closeButtonsComponent;
        }
        var decoratedOnInit = function(data, actions) {
            setInitActions(actions);
            if (typeof buttonProps.onInit === "function") {
                buttonProps.onInit(data, actions);
            }
        };
        try {
            buttons.current = paypalWindowNamespace.Buttons(__assign(__assign({}, proxyProps), {
                onInit: decoratedOnInit
            }));
        } catch (err) {
            return setErrorState(function() {
                throw new Error("Failed to render <PayPalButtons /> component. Failed to initialize:  ".concat(err));
            });
        }
        // only render the button when eligible
        if (buttons.current.isEligible() === false) {
            setIsEligible(false);
            return closeButtonsComponent;
        }
        if (!buttonsContainerRef.current) {
            return closeButtonsComponent;
        }
        buttons.current.render(buttonsContainerRef.current).catch(function(err) {
            // component failed to render, possibly because it was closed or destroyed.
            if (buttonsContainerRef.current === null || buttonsContainerRef.current.children.length === 0) {
                // paypal buttons container is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal buttons container is still in the DOM
            setErrorState(function() {
                throw new Error("Failed to render <PayPalButtons /> component. ".concat(err));
            });
        });
        return closeButtonsComponent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, __spreadArray(__spreadArray([
        isResolved
    ], forceReRender, true), [
        buttonProps.fundingSource
    ], false));
    // useEffect hook for managing disabled state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        if (initActions === null) {
            return;
        }
        if (disabled === true) {
            initActions.disable().catch(function() {
            // ignore errors when disabling the component
            });
        } else {
            initActions.enable().catch(function() {
            // ignore errors when enabling the component
            });
        }
    }, [
        disabled,
        initActions
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, null, isEligible ? __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: buttonsContainerRef,
        style: isDisabledStyle,
        className: classNames
    }) : children);
};
PayPalButtons.displayName = "PayPalButtons";
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function findScript(url, attributes) {
    var currentScript = document.querySelector("script[src=\"".concat(url, "\"]"));
    if (currentScript === null) return null;
    var nextScript = createScriptElement(url, attributes);
    var currentScriptClone = currentScript.cloneNode();
    delete currentScriptClone.dataset.uidAuto;
    if (Object.keys(currentScriptClone.dataset).length !== Object.keys(nextScript.dataset).length) {
        return null;
    }
    var isExactMatch = true;
    Object.keys(currentScriptClone.dataset).forEach(function(key) {
        if (currentScriptClone.dataset[key] !== nextScript.dataset[key]) {
            isExactMatch = false;
        }
    });
    return isExactMatch ? currentScript : null;
}
function insertScriptElement(_a) {
    var url = _a.url, attributes = _a.attributes, onSuccess = _a.onSuccess, onError = _a.onError;
    var newScript = createScriptElement(url, attributes);
    newScript.onerror = onError;
    newScript.onload = onSuccess;
    document.head.insertBefore(newScript, document.head.firstElementChild);
}
function processOptions(_a) {
    var customSdkBaseUrl = _a.sdkBaseUrl, environment = _a.environment, options = __rest(_a, [
        "sdkBaseUrl",
        "environment"
    ]);
    var sdkBaseUrl = customSdkBaseUrl || processSdkBaseUrl(environment);
    var optionsWithStringIndex = options;
    var _b = Object.keys(optionsWithStringIndex).filter(function(key) {
        return typeof optionsWithStringIndex[key] !== "undefined" && optionsWithStringIndex[key] !== null && optionsWithStringIndex[key] !== "";
    }).reduce(function(accumulator, key) {
        var value = optionsWithStringIndex[key].toString();
        key = camelCaseToKebabCase(key);
        if (key.substring(0, 4) === "data" || key === "crossorigin") {
            accumulator.attributes[key] = value;
        } else {
            accumulator.queryParams[key] = value;
        }
        return accumulator;
    }, {
        queryParams: {},
        attributes: {}
    }), queryParams = _b.queryParams, attributes = _b.attributes;
    if (queryParams["merchant-id"] && queryParams["merchant-id"].indexOf(",") !== -1) {
        attributes["data-merchant-id"] = queryParams["merchant-id"];
        queryParams["merchant-id"] = "*";
    }
    return {
        url: "".concat(sdkBaseUrl, "?").concat(objectToQueryString(queryParams)),
        attributes: attributes
    };
}
function camelCaseToKebabCase(str) {
    var replacer = function(match, indexOfMatch) {
        return (indexOfMatch ? "-" : "") + match.toLowerCase();
    };
    return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, replacer);
}
function objectToQueryString(params) {
    var queryString = "";
    Object.keys(params).forEach(function(key) {
        if (queryString.length !== 0) queryString += "&";
        queryString += key + "=" + params[key];
    });
    return queryString;
}
function processSdkBaseUrl(environment) {
    return environment === "sandbox" ? "https://www.sandbox.paypal.com/sdk/js" : "https://www.paypal.com/sdk/js";
}
function createScriptElement(url, attributes) {
    if (attributes === void 0) {
        attributes = {};
    }
    var newScript = document.createElement("script");
    newScript.src = url;
    Object.keys(attributes).forEach(function(key) {
        newScript.setAttribute(key, attributes[key]);
        if (key === "data-csp-nonce") {
            newScript.setAttribute("nonce", attributes["data-csp-nonce"]);
        }
    });
    return newScript;
}
function loadScript(options, PromisePonyfill) {
    if (PromisePonyfill === void 0) {
        PromisePonyfill = Promise;
    }
    validateArguments(options, PromisePonyfill);
    if (typeof document === "undefined") return PromisePonyfill.resolve(null);
    var _a = processOptions(options), url = _a.url, attributes = _a.attributes;
    var namespace = attributes["data-namespace"] || "paypal";
    var existingWindowNamespace = getPayPalWindowNamespace(namespace);
    if (!attributes["data-js-sdk-library"]) {
        attributes["data-js-sdk-library"] = "paypal-js";
    }
    if (findScript(url, attributes) && existingWindowNamespace) {
        return PromisePonyfill.resolve(existingWindowNamespace);
    }
    return loadCustomScript({
        url: url,
        attributes: attributes
    }, PromisePonyfill).then(function() {
        var newWindowNamespace = getPayPalWindowNamespace(namespace);
        if (newWindowNamespace) {
            return newWindowNamespace;
        }
        throw new Error("The window.".concat(namespace, " global variable is not available."));
    });
}
function loadCustomScript(options, PromisePonyfill) {
    if (PromisePonyfill === void 0) {
        PromisePonyfill = Promise;
    }
    validateArguments(options, PromisePonyfill);
    var url = options.url, attributes = options.attributes;
    if (typeof url !== "string" || url.length === 0) {
        throw new Error("Invalid url.");
    }
    if (typeof attributes !== "undefined" && typeof attributes !== "object") {
        throw new Error("Expected attributes to be an object.");
    }
    return new PromisePonyfill(function(resolve, reject) {
        if (typeof document === "undefined") return resolve();
        insertScriptElement({
            url: url,
            attributes: attributes,
            onSuccess: function() {
                return resolve();
            },
            onError: function() {
                var defaultError = new Error("The script \"".concat(url, "\" failed to load. Check the HTTP status code and response body in DevTools to learn more."));
                return reject(defaultError);
            }
        });
    });
}
function getPayPalWindowNamespace(namespace) {
    return window[namespace];
}
function validateArguments(options, PromisePonyfill) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Expected an options object.");
    }
    var environment = options.environment;
    if (environment && environment !== "production" && environment !== "sandbox") {
        throw new Error('The `environment` option must be either "production" or "sandbox".');
    }
    if (typeof PromisePonyfill !== "undefined" && typeof PromisePonyfill !== "function") {
        throw new Error("Expected PromisePonyfill to be a function.");
    }
}
/**
 * Simple check to determine if the Braintree is a valid namespace.
 *
 * @param braintreeSource the source {@link BraintreeNamespace}
 * @returns a boolean representing if the namespace is valid.
 */ var isValidBraintreeNamespace = function(braintreeSource) {
    var _a, _b;
    if (typeof ((_a = braintreeSource === null || braintreeSource === void 0 ? void 0 : braintreeSource.client) === null || _a === void 0 ? void 0 : _a.create) !== "function" && typeof ((_b = braintreeSource === null || braintreeSource === void 0 ? void 0 : braintreeSource.paypalCheckout) === null || _b === void 0 ? void 0 : _b.create) !== "function") {
        throw new Error("The braintreeNamespace property is not a valid BraintreeNamespace type.");
    }
    return true;
};
/**
 * Use `actions.braintree` to provide an interface for the paypalCheckoutInstance
 * through the createOrder, createBillingAgreement and onApprove callbacks
 *
 * @param braintreeButtonProps the component button options
 * @returns a new copy of the component button options casted as {@link PayPalButtonsComponentProps}
 */ var decorateActions = function(buttonProps, payPalCheckoutInstance) {
    var createOrderRef = buttonProps.createOrder;
    var createBillingAgreementRef = buttonProps.createBillingAgreement;
    var onApproveRef = buttonProps.onApprove;
    if (typeof createOrderRef === "function") {
        buttonProps.createOrder = function(data, actions) {
            return createOrderRef(data, __assign(__assign({}, actions), {
                braintree: payPalCheckoutInstance
            }));
        };
    }
    if (typeof createBillingAgreementRef === "function") {
        buttonProps.createBillingAgreement = function(data, actions) {
            return createBillingAgreementRef(data, __assign(__assign({}, actions), {
                braintree: payPalCheckoutInstance
            }));
        };
    }
    if (typeof onApproveRef === "function") {
        buttonProps.onApprove = function(data, actions) {
            return onApproveRef(data, __assign(__assign({}, actions), {
                braintree: payPalCheckoutInstance
            }));
        };
    }
    return __assign({}, buttonProps);
};
/**
 * Get the Braintree namespace from the component props.
 * If the prop `braintreeNamespace` is undefined will try to load it from the CDN.
 * This function allows users to set the braintree manually on the `BraintreePayPalButtons` component.
 *
 * Use case can be for example legacy sites using AMD/UMD modules,
 * trying to integrate the `BraintreePayPalButtons` component.
 * If we attempt to load the Braintree from the CDN won't define the braintree namespace.
 * This happens because the braintree script is an UMD module.
 * After detecting the AMD on the global scope will create an anonymous module using `define`
 * and the `BraintreePayPalButtons` won't be able to get access to the `window.braintree` namespace
 * from the global context.
 *
 * @param braintreeSource the source {@link BraintreeNamespace}
 * @returns the {@link BraintreeNamespace}
 */ var getBraintreeNamespace = function(braintreeSource) {
    if (braintreeSource && isValidBraintreeNamespace(braintreeSource)) {
        return Promise.resolve(braintreeSource);
    }
    return Promise.all([
        loadCustomScript({
            url: BRAINTREE_SOURCE
        }),
        loadCustomScript({
            url: BRAINTREE_PAYPAL_CHECKOUT_SOURCE
        })
    ]).then(function() {
        return getBraintreeWindowNamespace();
    });
};
/**
This `<BraintreePayPalButtons />` component renders the [Braintree PayPal Buttons](https://developer.paypal.com/braintree/docs/guides/paypal/overview) for Braintree Merchants.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.

Note: You are able to make your integration using the client token or using the tokenization key.

- To use the client token integration set the key `dataClientToken` in the `PayPayScriptProvider` component's options.
- To use the tokenization key integration set the key `dataUserIdToken` in the `PayPayScriptProvider` component's options.
*/ var BraintreePayPalButtons = function(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, children = _a.children, _d = _a.forceReRender, forceReRender = _d === void 0 ? [] : _d, braintreeNamespace = _a.braintreeNamespace, merchantAccountId = _a.merchantAccountId, buttonProps = __rest$1(_a, [
        "className",
        "disabled",
        "children",
        "forceReRender",
        "braintreeNamespace",
        "merchantAccountId"
    ]);
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setErrorState = _e[1];
    var _f = useScriptProviderContext(), providerContext = _f[0], dispatch = _f[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        getBraintreeNamespace(braintreeNamespace).then(function(braintree) {
            var clientTokenizationKey = providerContext.options[SDK_SETTINGS.DATA_USER_ID_TOKEN];
            var clientToken = providerContext.options[SDK_SETTINGS.DATA_CLIENT_TOKEN];
            return braintree.client.create({
                authorization: clientTokenizationKey || clientToken
            }).then(function(clientInstance) {
                var merchantProp = merchantAccountId ? {
                    merchantAccountId: merchantAccountId
                } : {};
                return braintree.paypalCheckout.create(__assign(__assign({}, merchantProp), {
                    client: clientInstance
                }));
            }).then(function(paypalCheckoutInstance) {
                dispatch({
                    type: DISPATCH_ACTION.SET_BRAINTREE_INSTANCE,
                    value: paypalCheckoutInstance
                });
            });
        }).catch(function(err) {
            setErrorState(function() {
                throw new Error("".concat(LOAD_SCRIPT_ERROR, " ").concat(err));
            });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        providerContext.options
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, null, providerContext.braintreePayPalCheckoutInstance && __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalButtons, __assign({
        className: className,
        disabled: disabled,
        forceReRender: forceReRender
    }, decorateActions(buttonProps, providerContext.braintreePayPalCheckoutInstance)), children));
};
/**
The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons.
The [Display PayPal Buttons with other Payment Methods guide](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#display-paypal-buttons-with-other-payment-methods) describes this style of integration in detail.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.

This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
A `FUNDING` object is exported by this library which has a key for every available funding source option.
*/ var PayPalMarks = function(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, children = _a.children, markProps = __rest$1(_a, [
        "className",
        "children"
    ]);
    var _c = usePayPalScriptReducer()[0], isResolved = _c.isResolved, options = _c.options;
    var markContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var _d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true), isEligible = _d[0], setIsEligible = _d[1];
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setErrorState = _e[1];
    /**
   * Render PayPal Mark into the DOM
   */ var renderPayPalMark = function(mark) {
        var current = markContainerRef.current;
        // only render the mark when eligible
        if (!current || !mark.isEligible()) {
            return setIsEligible(false);
        }
        // Remove any children before render it again
        if (current.firstChild) {
            current.removeChild(current.firstChild);
        }
        mark.render(current).catch(function(err) {
            // component failed to render, possibly because it was closed or destroyed.
            if (current === null || current.children.length === 0) {
                // paypal marks container is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal marks container is still in the DOM
            setErrorState(function() {
                throw new Error("Failed to render <PayPalMarks /> component. ".concat(err));
            });
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return;
        }
        var paypalWindowNamespace = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE]);
        // verify dependency on window object
        if (paypalWindowNamespace === undefined || paypalWindowNamespace.Marks === undefined) {
            return setErrorState(function() {
                throw new Error(generateErrorMessage({
                    reactComponentName: PayPalMarks.displayName,
                    sdkComponentKey: "marks",
                    sdkRequestedComponents: options.components,
                    sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
                }));
            });
        }
        renderPayPalMark(paypalWindowNamespace.Marks(__assign({}, markProps)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isResolved,
        markProps.fundingSource
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, null, isEligible ? __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: markContainerRef,
        className: className
    }) : children);
};
PayPalMarks.displayName = "PayPalMarks";
/**
This `<PayPalMessages />` messages component renders a credit messaging on upstream merchant sites.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/ var PayPalMessages = function(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.forceReRender, forceReRender = _c === void 0 ? [] : _c, messageProps = __rest$1(_a, [
        "className",
        "forceReRender"
    ]);
    var _d = usePayPalScriptReducer()[0], isResolved = _d.isResolved, options = _d.options;
    var messagesContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setErrorState = _e[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return;
        }
        var paypalWindowNamespace = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE]);
        // verify dependency on window object
        if (paypalWindowNamespace === undefined || paypalWindowNamespace.Messages === undefined) {
            return setErrorState(function() {
                throw new Error(generateErrorMessage({
                    reactComponentName: PayPalMessages.displayName,
                    sdkComponentKey: "messages",
                    sdkRequestedComponents: options.components,
                    sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
                }));
            });
        }
        messages.current = paypalWindowNamespace.Messages(__assign({}, messageProps));
        messages.current.render(messagesContainerRef.current).catch(function(err) {
            // component failed to render, possibly because it was closed or destroyed.
            if (messagesContainerRef.current === null || messagesContainerRef.current.children.length === 0) {
                // paypal messages container is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal messages container is still in the DOM
            setErrorState(function() {
                throw new Error("Failed to render <PayPalMessages /> component. ".concat(err));
            });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, __spreadArray([
        isResolved
    ], forceReRender, true));
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: messagesContainerRef,
        className: className
    });
};
PayPalMessages.displayName = "PayPalMessages";
/**
This `<PayPalScriptProvider />` component takes care of loading the JS SDK `<script>`.
It manages state for script loading so children components like `<PayPalButtons />` know when it's safe to use the `window.paypal` global namespace.

Note: You always should use this component as a wrapper for  `PayPalButtons`, `PayPalMarks`, `PayPalMessages` and `BraintreePayPalButtons` components.
 */ var PayPalScriptProvider = function(_a) {
    var _b;
    var _c = _a.options, options = _c === void 0 ? {
        clientId: "test"
    } : _c, children = _a.children, _d = _a.deferLoading, deferLoading = _d === void 0 ? false : _d;
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(scriptReducer, {
        options: __assign(__assign({}, options), (_b = {}, _b[SDK_SETTINGS.DATA_JS_SDK_LIBRARY] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SCRIPT_ID] = "".concat(getScriptID(options)), _b)),
        loadingStatus: deferLoading ? SCRIPT_LOADING_STATE.INITIAL : SCRIPT_LOADING_STATE.PENDING
    }), state = _e[0], dispatch = _e[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        if (deferLoading === false && state.loadingStatus === SCRIPT_LOADING_STATE.INITIAL) {
            return dispatch({
                type: DISPATCH_ACTION.LOADING_STATUS,
                value: SCRIPT_LOADING_STATE.PENDING
            });
        }
        if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) {
            return;
        }
        var isSubscribed = true;
        loadScript(state.options).then(function() {
            if (isSubscribed) {
                dispatch({
                    type: DISPATCH_ACTION.LOADING_STATUS,
                    value: SCRIPT_LOADING_STATE.RESOLVED
                });
            }
        }).catch(function(err) {
            console.error("".concat(LOAD_SCRIPT_ERROR, " ").concat(err));
            if (isSubscribed) {
                dispatch({
                    type: DISPATCH_ACTION.LOADING_STATUS,
                    value: {
                        state: SCRIPT_LOADING_STATE.REJECTED,
                        message: String(err)
                    }
                });
            }
        });
        return function() {
            isSubscribed = false;
        };
    }, [
        state.options,
        deferLoading,
        state.loadingStatus
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(ScriptContext.Provider, {
        value: __assign(__assign({}, state), {
            dispatch: dispatch
        })
    }, children);
};
/**
 * Custom hook to store registered hosted fields children
 * Each `PayPalHostedField` component should be registered on the parent provider
 *
 * @param initialValue the initially registered components
 * @returns at first, an {@link Object} containing the registered hosted fields,
 * and at the second a function handler to register the hosted fields components
 */ var useHostedFieldsRegister = function(initialValue) {
    if (initialValue === void 0) {
        initialValue = {};
    }
    var registeredFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(initialValue);
    var registerHostedField = function(component) {
        registeredFields.current = __assign(__assign({}, registeredFields.current), component);
    };
    return [
        registeredFields,
        registerHostedField
    ];
};
/**
 * Throw an exception if the HostedFields is not found in the paypal namespace
 * Probably cause for this problem is not sending the hosted-fields string
 * as part of the components props in options
 * {@code <PayPalScriptProvider options={{ components: 'hosted-fields'}}>}
 *
 * @param param0 and object containing the components and namespace defined in options
 * @throws {@code Error}
 *
 */ var generateMissingHostedFieldsError = function(_a) {
    var _b = _a.components, components = _b === void 0 ? "" : _b, _c = SDK_SETTINGS.DATA_NAMESPACE, _d = _a[_c], dataNamespace = _d === void 0 ? DEFAULT_PAYPAL_NAMESPACE : _d;
    var expectedComponents = components ? "".concat(components, ",hosted-fields") : "hosted-fields";
    var errorMessage = "Unable to render <PayPalHostedFieldsProvider /> because window.".concat(dataNamespace, ".HostedFields is undefined.");
    if (!components.includes("hosted-fields")) {
        errorMessage += "\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: '".concat(expectedComponents, "'}}>");
    }
    return errorMessage;
};
/**
 * Validate the expiration date component. Valid combinations are:
 * 1- Only the `expirationDate` field exists.
 * 2- Only the `expirationMonth` and `expirationYear` fields exist. Cannot be used with the `expirationDate` field.
 *
 * @param registerTypes
 * @returns @type {true} when the children are valid
 */ var validateExpirationDate = function(registerTypes) {
    return !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE) && !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_MONTH) && !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_YEAR);
};
/**
 * Check if we find the [number, expiration, cvv] in children
 *
 * @param requiredChildren the list with required children [number, expiration, cvv]
 * @param registerTypes    the list of all the children types pass to the parent
 * @throw an @type {Error} when not find the default children
 */ var hasDefaultChildren = function(registerTypes) {
    if (!registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.NUMBER) || !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.CVV) || validateExpirationDate(registerTypes)) {
        throw new Error(HOSTED_FIELDS_CHILDREN_ERROR);
    }
};
/**
 * Check if we don't have duplicate children types
 *
 * @param registerTypes the list of all the children types pass to the parent
 * @throw an @type {Error} when duplicate types was found
 */ var noDuplicateChildren = function(registerTypes) {
    if (registerTypes.length !== new Set(registerTypes).size) {
        throw new Error(HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR);
    }
};
/**
 * Validate the hosted field children in the PayPalHostedFieldsProvider component.
 * These are the rules:
 * 1- We need to find 3 default children for number, expiration, cvv
 * 2- No duplicate children are allowed
 * 3- No invalid combinations of `expirationDate`, `expirationMonth`, and `expirationYear`
 *
 * @param childrenList     the list of children
 * @param requiredChildren the list with required children [number, expiration, cvv]
 */ var validateHostedFieldChildren = function(registeredFields) {
    hasDefaultChildren(registeredFields);
    noDuplicateChildren(registeredFields);
};
/**
This `<PayPalHostedFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.

This provider component is designed to be used with the `<PayPalHostedField />` component.

Warning: If you don't see anything in the screen probably your client is ineligible.
To handle this problem make sure to use the prop `notEligibleError` and pass a component with a custom message.
Take a look to this link if that is the case: https://developer.paypal.com/docs/checkout/advanced/integrate/
*/ var PayPalHostedFieldsProvider = function(_a) {
    var styles = _a.styles, createOrder = _a.createOrder, notEligibleError = _a.notEligibleError, children = _a.children, installments = _a.installments;
    var _b = useScriptProviderContext()[0], options = _b.options, loadingStatus = _b.loadingStatus;
    var _c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true), isEligible = _c[0], setIsEligible = _c[1];
    var _d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(), cardFields = _d[0], setCardFields = _d[1];
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setErrorState = _e[1];
    var hostedFieldsContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var hostedFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])();
    var _f = useHostedFieldsRegister(), registeredFields = _f[0], registerHostedField = _f[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        var _a;
        validateHostedFieldChildren(Object.keys(registeredFields.current));
        // Only render the hosted fields when script is loaded and hostedFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }
        // Get the hosted fields from the [window.paypal.HostedFields] SDK
        hostedFields.current = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE]).HostedFields;
        if (!hostedFields.current) {
            throw new Error(generateMissingHostedFieldsError((_a = {
                components: options.components
            }, _a[SDK_SETTINGS.DATA_NAMESPACE] = options[SDK_SETTINGS.DATA_NAMESPACE], _a)));
        }
        if (!hostedFields.current.isEligible()) {
            return setIsEligible(false);
        }
        // Clean all the fields before the rerender
        if (cardFields) {
            cardFields.teardown();
        }
        hostedFields.current.render({
            // Call your server to set up the transaction
            createOrder: createOrder,
            fields: registeredFields.current,
            installments: installments,
            styles: styles
        }).then(function(cardFieldsInstance) {
            if (hostedFieldsContainerRef.current) {
                setCardFields(cardFieldsInstance);
            }
        }).catch(function(err) {
            setErrorState(function() {
                throw new Error("Failed to render <PayPalHostedFieldsProvider /> component. ".concat(err));
            });
        });
    }, [
        loadingStatus,
        styles
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: hostedFieldsContainerRef
    }, isEligible ? __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalHostedFieldsContext.Provider, {
        value: {
            cardFields: cardFields,
            registerHostedField: registerHostedField
        }
    }, children) : notEligibleError);
};
/**
This `<PayPalHostedField />` component renders individual fields for [Hosted Fields](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/integrate#3-add-javascript-sdk-and-card-form) integrations.
It relies on the `<PayPalHostedFieldsProvider />` parent component for managing state related to loading the JS SDK script
and execute some validations before the rendering the fields.

To use the PayPal hosted fields you need to define at least three fields:

- A card number field
- The CVV code from the client card
- The expiration date

You can define the expiration date as a single field similar to the example below,
or you are able to define it in [two separate fields](https://paypal.github.io/react-paypal-js//?path=/docs/paypal-paypalhostedfields--expiration-date). One for the month and second for year.

Note: Take care when using multiple instances of the PayPal Hosted Fields on the same page.
The component will fail to render when any of the selectors return more than one element.
*/ var PayPalHostedField = function(_a) {
    var hostedFieldType = _a.hostedFieldType, // eslint-disable-line @typescript-eslint/no-unused-vars
    options = _a.options, // eslint-disable-line @typescript-eslint/no-unused-vars
    props = __rest$1(_a, [
        "hostedFieldType",
        "options"
    ]);
    var hostedFieldContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PayPalHostedFieldsContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        var _a;
        if (!(hostedFieldContext === null || hostedFieldContext === void 0 ? void 0 : hostedFieldContext.registerHostedField)) {
            throw new Error("The HostedField cannot be register in the PayPalHostedFieldsProvider parent component");
        }
        // Register in the parent provider
        hostedFieldContext.registerHostedField((_a = {}, _a[hostedFieldType] = {
            selector: options.selector,
            placeholder: options.placeholder,
            type: options.type,
            formatInput: options.formatInput,
            maskInput: options.maskInput,
            select: options.select,
            maxlength: options.maxlength,
            minlength: options.minlength,
            prefill: options.prefill,
            rejectUnsupportedCards: options.rejectUnsupportedCards
        }, _a));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", __assign({}, props));
};
/**
 * Throw an exception if the CardFields is not found in the paypal namespace
 * Probably cause for this problem is not sending the card-fields string
 * as part of the components props in options
 * {@code <PayPalScriptProvider options={{ components: 'card-fields'}}>}
 *
 * @param param0 and object containing the components and namespace defined in options
 * @throws {@code Error}
 *
 */ var generateMissingCardFieldsError = function(_a) {
    var _b = _a.components, components = _b === void 0 ? "" : _b, _c = SDK_SETTINGS.DATA_NAMESPACE, _d = _a[_c], dataNamespace = _d === void 0 ? DEFAULT_PAYPAL_NAMESPACE : _d;
    var expectedComponents = components ? "".concat(components, ",card-fields") : "card-fields";
    var errorMessage = "Unable to render <PayPalCardFieldsProvider /> because window.".concat(dataNamespace, ".CardFields is undefined.");
    if (!components.includes("card-fields")) {
        errorMessage += "\nTo fix the issue, add 'card-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: '".concat(expectedComponents, "'}}>");
    }
    return errorMessage;
};
function ignore() {
    return;
}
function hasChildren(container) {
    var _a;
    return !!((_a = container.current) === null || _a === void 0 ? void 0 : _a.children.length);
}
var PayPalCardFieldsContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    cardFieldsForm: null,
    fields: {},
    registerField: ignore,
    unregisterField: ignore // implementation is inside hook and passed through the provider
});
var usePayPalCardFields = function() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PayPalCardFieldsContext);
};
var usePayPalCardFieldsRegistry = function() {
    var _a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setError = _a[1];
    var registeredFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    var registerField = function() {
        var props = [];
        for(var _i = 0; _i < arguments.length; _i++){
            props[_i] = arguments[_i];
        }
        var fieldName = props[0], options = props[1], cardFields = props[2];
        if (registeredFields.current[fieldName]) {
            setError(function() {
                throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
            });
        }
        registeredFields.current[fieldName] = cardFields === null || cardFields === void 0 ? void 0 : cardFields[fieldName](options);
        return registeredFields.current[fieldName];
    };
    var unregisterField = function(fieldName) {
        var field = registeredFields.current[fieldName];
        if (field) {
            field.close().catch(ignore);
            delete registeredFields.current[fieldName];
        }
    };
    return {
        fields: registeredFields.current,
        registerField: registerField,
        unregisterField: unregisterField
    };
};
var FullWidthContainer = function(_a) {
    var children = _a.children;
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        style: {
            width: "100%"
        }
    }, children);
};
/**
The `<PayPalCardFieldsProvider />` is a context provider that is designed to support the rendering and state management of PayPal CardFields in your application.

The context provider will initialize the `CardFields` instance from the JS SDK and determine eligibility to render the CardField components. Once the `CardFields` are initialized, the context provider will manage the state of the `CardFields` instance as well as the reference to each individual card field.

Passing the `inputEvents` and `style` props to the context provider will apply them to each of the individual field components.

The state managed by the provider is accessible through our custom hook `usePayPalCardFields`.

*/ var PayPalCardFieldsProvider = function(_a) {
    var children = _a.children, props = __rest$1(_a, [
        "children"
    ]);
    var proxyInputEvents = useProxyProps(props.inputEvents);
    var proxyProps = useProxyProps(props);
    var _b = usePayPalScriptReducer()[0], isResolved = _b.isResolved, options = _b.options;
    var _c = usePayPalCardFieldsRegistry(), fields = _c.fields, registerField = _c.registerField, unregisterField = _c.unregisterField;
    var _d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), cardFieldsForm = _d[0], setCardFieldsForm = _d[1];
    var cardFieldsInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var _e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), isEligible = _e[0], setIsEligible = _e[1];
    // We set the error inside state so that it can be caught by React's error boundary
    var _f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setError = _f[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        var _a, _b, _c;
        if (!isResolved) {
            return;
        }
        if (props.inputEvents) {
            proxyProps.inputEvents = proxyInputEvents;
        }
        try {
            cardFieldsInstance.current = (_c = (_b = (_a = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE])).CardFields) === null || _b === void 0 ? void 0 : _b.call(_a, __assign({}, proxyProps))) !== null && _c !== void 0 ? _c : null;
        } catch (error) {
            setError(function() {
                throw new Error("Failed to render <PayPalCardFieldsProvider /> component. Failed to initialize:  ".concat(error));
            });
            return;
        }
        if (!cardFieldsInstance.current) {
            setError(function() {
                var _a;
                throw new Error(generateMissingCardFieldsError((_a = {
                    components: options.components
                }, _a[SDK_SETTINGS.DATA_NAMESPACE] = options[SDK_SETTINGS.DATA_NAMESPACE], _a)));
            });
            return;
        }
        setIsEligible(cardFieldsInstance.current.isEligible());
        setCardFieldsForm(cardFieldsInstance.current);
        return function() {
            setCardFieldsForm(null);
            cardFieldsInstance.current = null;
        };
    }, [
        isResolved
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!isEligible) {
        // TODO: What should be returned here?
        return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", null);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(FullWidthContainer, null, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardFieldsContext.Provider, {
        value: {
            cardFieldsForm: cardFieldsForm,
            fields: fields,
            registerField: registerField,
            unregisterField: unregisterField
        }
    }, children));
};
var PayPalCardField = function(_a) {
    var className = _a.className, fieldName = _a.fieldName, options = __rest$1(_a, [
        "className",
        "fieldName"
    ]);
    var _b = usePayPalCardFields(), cardFieldsForm = _b.cardFieldsForm, registerField = _b.registerField, unregisterField = _b.unregisterField;
    var containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var proxyInputEvents = useProxyProps(options.inputEvents);
    // Set errors is state so that they can be caught by React's error boundary
    var _c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), setError = _c[1];
    function closeComponent() {
        unregisterField(fieldName);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(function() {
        if (!cardFieldsForm) {
            setError(function() {
                throw new Error(CARD_FIELDS_CONTEXT_ERROR);
            });
            return closeComponent;
        }
        if (!containerRef.current) {
            return closeComponent;
        }
        if (options.inputEvents) {
            options.inputEvents = proxyInputEvents;
        }
        var registeredField = registerField(fieldName, options, cardFieldsForm);
        registeredField === null || registeredField === void 0 ? void 0 : registeredField.render(containerRef.current).catch(function(err) {
            if (!hasChildren(containerRef)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(function() {
                throw new Error("Failed to render <PayPal".concat(fieldName, " /> component. ").concat(err));
            });
        });
        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        ref: containerRef,
        className: className
    });
};
var PayPalNameField = function(options) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, __assign({
        fieldName: "NameField"
    }, options));
};
var PayPalNumberField = function(options) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, __assign({
        fieldName: "NumberField"
    }, options));
};
var PayPalExpiryField = function(options) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, __assign({
        fieldName: "ExpiryField"
    }, options));
};
var PayPalCVVField = function(options) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, __assign({
        fieldName: "CVVField"
    }, options));
};
var FlexContainer = function(_a) {
    var children = _a.children;
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        style: {
            display: "flex",
            width: "100%"
        }
    }, children);
};
/**
This `<PayPalCardFieldsForm />` component renders the 4 individual fields for [Card Fields](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/integrate#3-add-javascript-sdk-and-card-form) integrations.
This setup relies on the `<PayPalCardFieldsProvider />` parent component, which manages the state related to loading the JS SDK script and performs certain validations before rendering the fields.



Note: If you want to have more granular control over the layout of how the fields are rendered, you can alternatively use our Individual Fields.
*/ var PayPalCardFieldsForm = function(_a) {
    var className = _a.className;
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        className: className
    }, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, {
        fieldName: "NameField"
    }), __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, {
        fieldName: "NumberField"
    }), __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(FlexContainer, null, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(FullWidthContainer, null, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, {
        fieldName: "ExpiryField"
    })), __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(FullWidthContainer, null, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PayPalCardField, {
        fieldName: "CVVField"
    }))));
};
var FUNDING$1 = {
    PAYPAL: "paypal",
    VENMO: "venmo",
    APPLEPAY: "applepay",
    ITAU: "itau",
    CREDIT: "credit",
    PAYLATER: "paylater",
    CARD: "card",
    IDEAL: "ideal",
    SEPA: "sepa",
    BANCONTACT: "bancontact",
    GIROPAY: "giropay",
    SOFORT: "sofort",
    EPS: "eps",
    MYBANK: "mybank",
    P24: "p24",
    PAYU: "payu",
    BLIK: "blik",
    TRUSTLY: "trustly",
    OXXO: "oxxo",
    BOLETO: "boleto",
    BOLETOBANCARIO: "boletobancario",
    WECHATPAY: "wechatpay",
    MERCADOPAGO: "mercadopago",
    MULTIBANCO: "multibanco",
    SATISPAY: "satispay",
    PAIDY: "paidy",
    ZIMPLER: "zimpler",
    MAXIMA: "maxima"
};
[
    FUNDING$1.IDEAL,
    FUNDING$1.BANCONTACT,
    FUNDING$1.GIROPAY,
    FUNDING$1.SOFORT,
    FUNDING$1.EPS,
    FUNDING$1.MYBANK,
    FUNDING$1.P24,
    FUNDING$1.PAYU,
    FUNDING$1.BLIK,
    FUNDING$1.TRUSTLY,
    FUNDING$1.OXXO,
    FUNDING$1.BOLETO,
    FUNDING$1.BOLETOBANCARIO,
    FUNDING$1.WECHATPAY,
    FUNDING$1.MERCADOPAGO,
    FUNDING$1.MULTIBANCO,
    FUNDING$1.SATISPAY,
    FUNDING$1.PAIDY,
    FUNDING$1.MAXIMA,
    FUNDING$1.ZIMPLER
];
// We do not re-export `FUNDING` from the `sdk-constants` module
// directly because it has no type definitions.
//
// See https://github.com/paypal/react-paypal-js/issues/125
var FUNDING = FUNDING$1;
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fc33b970._.js.map