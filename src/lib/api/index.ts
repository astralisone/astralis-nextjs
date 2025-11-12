/**
 * API Client Exports
 *
 * This file provides a unified interface for making API calls
 * from both client and server components.
 */

// Client-side API utilities
export { apiClient } from './client';

// Server-side API utilities
export {
  serverApi,
  serverApiClient,
  safeServerApi,
  getServerToken,
  type ApiResponse,
} from './server';

// Type definitions
export type {
  // User & Auth
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,

  // Blog
  BlogPost,
  Category,
  Tag,
  Comment,
  BlogPostQuery,
  CreateBlogPostData,
  UpdateBlogPostData,

  // Marketplace
  MarketplaceItem,
  CartItem,
  MarketplaceQuery,
  CreateMarketplaceItemData,
  UpdateMarketplaceItemData,

  // Testimonials
  Testimonial,

  // Admin
  AdminStats,

  // Orders
  Order,
  Address,

  // Pagination
  PaginatedResponse,
  PaginationParams,

  // API Responses
  ApiSuccessResponse,
  ApiErrorResponse,

  // Contact
  ContactFormData,

  // Health
  HealthCheckResponse,
} from './types';

// Type guards
export { isApiError, isApiSuccess } from './types';

// Default export for backward compatibility
export { apiClient as default } from './client';

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
 */
