(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/projects/astralis-nextjs/src/lib/api/client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/axios/lib/axios.js [client] (ecmascript)");
;
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});
// Request interceptor to add auth token
apiClient.interceptors.request.use((config)=>{
    // Get token from localStorage (client-side only)
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor for error handling
apiClient.interceptors.response.use((response)=>response, (error)=>{
    if (error.response?.status === 401) {
        // Handle unauthorized access
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/api/server.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server-side API utilities for Next.js SSR and SSG
 *
 * Use these functions in:
 * - Server Components
 * - API Routes
 * - getServerSideProps
 * - getStaticProps
 */ __turbopack_context__.s([
    "getServerToken",
    ()=>getServerToken,
    "safeServerApi",
    ()=>safeServerApi,
    "serverApi",
    ()=>serverApi,
    "serverApiClient",
    ()=>serverApiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
async function serverApi(endpoint, options) {
    const { token, ...fetchOptions } = options || {};
    const url = `${API_BASE_URL}/api${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
    };
    // Add authorization token if provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers
        });
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${text}`);
            }
            return text;
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Server API Error [${endpoint}]:`, error);
        throw error;
    }
}
const serverApiClient = {
    /**
   * GET request
   */ get: async (endpoint, options)=>{
        return serverApi(endpoint, {
            ...options,
            method: 'GET'
        });
    },
    /**
   * POST request
   */ post: async (endpoint, data, options)=>{
        return serverApi(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    /**
   * PUT request
   */ put: async (endpoint, data, options)=>{
        return serverApi(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    /**
   * PATCH request
   */ patch: async (endpoint, data, options)=>{
        return serverApi(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    /**
   * DELETE request
   */ delete: async (endpoint, options)=>{
        return serverApi(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }
};
function getServerToken() {
    // TODO: Implement based on NextAuth or your auth solution
    // Example with cookies:
    // import { cookies } from 'next/headers';
    // const cookieStore = cookies();
    // return cookieStore.get('auth-token')?.value;
    return undefined;
}
async function safeServerApi(endpoint, options) {
    try {
        const data = await serverApi(endpoint, options);
        return {
            data,
            error: null,
            status: 200
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 500
        };
    }
} /**
 * Example usage in Server Components:
 *
 * ```tsx
 * import { serverApiClient } from '@/lib/api/server';
 *
 * export default async function BlogPage() {
 *   const posts = await serverApiClient.get('/blog/posts');
 *   return <div>...</div>;
 * }
 * ```
 *
 * With error handling:
 *
 * ```tsx
 * import { safeServerApi } from '@/lib/api/server';
 *
 * export default async function BlogPage() {
 *   const { data: posts, error } = await safeServerApi('/blog/posts');
 *   if (error) return <div>Error: {error}</div>;
 *   return <div>...</div>;
 * }
 * ```
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/api/types.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API Response Types
 *
 * TypeScript interfaces for API responses from the Express backend
 */ // User & Authentication Types
__turbopack_context__.s([
    "isApiError",
    ()=>isApiError,
    "isApiSuccess",
    ()=>isApiSuccess
]);
function isApiError(response) {
    return response.success === false;
}
function isApiSuccess(response) {
    return response.success === true;
} /**
 * Usage Examples:
 *
 * ```typescript
 * import { apiClient } from '@/lib/api';
 * import type { BlogPost, PaginatedResponse } from '@/lib/api/types';
 *
 * // Type-safe API call
 * const response = await apiClient.get<PaginatedResponse<BlogPost>>('/api/blog/posts');
 * const posts = response.data.data;
 *
 * // With type guard
 * const result = await apiClient.get<ApiResponse<User>>('/api/auth/me');
 * if (isApiSuccess(result.data)) {
 *   const user = result.data.data;
 * }
 * ```
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/lib/api/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * API Client Exports
 *
 * This file provides a unified interface for making API calls
 * from both client and server components.
 */ // Client-side API utilities
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/client.ts [client] (ecmascript)");
// Server-side API utilities
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$server$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/server.ts [client] (ecmascript)");
// Type guards
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$types$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/types.ts [client] (ecmascript)");
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 /**
 * Usage Examples:
 *
 * Client Component:
 * ```tsx
 * 'use client';
 * import { apiClient } from '@/lib/api';
 * import type { BlogPost, PaginatedResponse } from '@/lib/api';
 *
 * const response = await apiClient.get<PaginatedResponse<BlogPost>>('/api/blog/posts');
 * const posts = response.data.data;
 * ```
 *
 * Server Component:
 * ```tsx
 * import { serverApiClient } from '@/lib/api';
 * import type { BlogPost } from '@/lib/api';
 *
 * const posts = await serverApiClient.get<BlogPost[]>('/blog/posts');
 * ```
 *
 * With Error Handling:
 * ```tsx
 * import { safeServerApi, isApiSuccess } from '@/lib/api';
 * import type { User } from '@/lib/api';
 *
 * const result = await safeServerApi<User>('/auth/me');
 * if (result.error) return <div>Error: {result.error}</div>;
 * ```
 */ }),
"[project]/projects/astralis-nextjs/src/lib/api/client.ts [client] (ecmascript) <export apiClient as default>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiClient"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/client.ts [client] (ecmascript)");
}),
"[project]/projects/astralis-nextjs/src/components/providers/auth-provider.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$export__apiClient__as__default$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/api/client.ts [client] (ecmascript) <export apiClient as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/navigation.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
// Create context
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Check if user is authenticated on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkAuth = {
                "AuthProvider.useEffect.checkAuth": async ()=>{
                    const token = localStorage.getItem("token");
                    const storedUser = localStorage.getItem("user");
                    if (token && storedUser) {
                        try {
                            // Verify token with server
                            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$export__apiClient__as__default$3e$__["default"].get("/auth/me", {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            // Set user from response
                            setUser(response.data.data);
                        } catch (error) {
                            // Clear invalid token/user
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                    setIsLoading(false);
                }
            }["AuthProvider.useEffect.checkAuth"];
            checkAuth();
        }
    }["AuthProvider.useEffect"], []);
    // Login function
    const login = async (email, password)=>{
        setIsLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$export__apiClient__as__default$3e$__["default"].post("/auth/login", {
                email,
                password
            });
            // Store token and user data
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data));
            // Set user state
            setUser(response.data.data);
            // Redirect based on role
            if (response.data.data.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (error) {
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    // Logout function
    const logout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };
    // Register function
    const register = async (name, email, password)=>{
        setIsLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$export__apiClient__as__default$3e$__["default"].post("/auth/register", {
                name,
                email,
                password
            });
            // Store token and user data
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data));
            // Set user state
            setUser(response.data.data);
            // Redirect to home
            router.push("/");
        } catch (error) {
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    // Context value
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isPM: user?.role === "PM",
        isAdminOrPM: user?.role === "ADMIN" || user?.role === "PM",
        login,
        logout,
        register
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/providers/auth-provider.tsx",
        lineNumber: 147,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "8WEfEbosx3NfLBPRVajZSQS3udc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const initialState = {
    theme: "system",
    setTheme: ()=>null
};
const ThemeProviderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(initialState);
function ThemeProvider({ children, defaultTheme = "dark", storageKey = "astralis-theme", ...props }) {
    _s();
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Hydration-safe initialization
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            setMounted(true);
            const storedTheme = localStorage.getItem(storageKey);
            if (storedTheme) {
                setTheme(storedTheme);
            }
        }
    }["ThemeProvider.useEffect"], [
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            if (!mounted) return;
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            if (theme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                root.classList.add(systemTheme);
                return;
            }
            root.classList.add(theme);
        }
    }["ThemeProvider.useEffect"], [
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProviderContext.Provider, {
        ...props,
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "O2iXXcoCegWUrHJV7GB0gi7uKwY=");
_c = ThemeProvider;
const useTheme = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeProviderContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/astralis-nextjs/src/pages/_app.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$auth$2d$provider$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/providers/auth-provider.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$theme$2d$provider$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/components/providers/theme-provider.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2d$helmet$2d$async$2f$lib$2f$index$2e$esm$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/react-helmet-async/lib/index.esm.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next-auth/react.js [client] (ecmascript)");
;
;
;
;
;
;
function App({ Component, pageProps: { session, ...pageProps } }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SessionProvider"], {
        session: session,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$auth$2d$provider$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$components$2f$providers$2f$theme$2d$provider$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
                defaultTheme: "dark",
                storageKey: "astralis-theme",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2d$helmet$2d$async$2f$lib$2f$index$2e$esm$2e$js__$5b$client$5d$__$28$ecmascript$29$__["HelmetProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                        ...pageProps
                    }, void 0, false, {
                        fileName: "[project]/projects/astralis-nextjs/src/pages/_app.tsx",
                        lineNumber: 14,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/projects/astralis-nextjs/src/pages/_app.tsx",
                    lineNumber: 13,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/projects/astralis-nextjs/src/pages/_app.tsx",
                lineNumber: 12,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/projects/astralis-nextjs/src/pages/_app.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/projects/astralis-nextjs/src/pages/_app.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
_c = App;
var _c;
__turbopack_context__.k.register(_c, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/projects/astralis-nextjs/src/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/_app";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/projects/astralis-nextjs/src/pages/_app.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/projects/astralis-nextjs/src/pages/_app\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/projects/astralis-nextjs/src/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__2b96ce5c._.js.map