/**
 * API Response Types
 *
 * TypeScript interfaces for API responses from the Express backend
 */

// User & Authentication Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Blog Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: string;
  author: User;
  authorId: number;
  categories: Category[];
  tags: Tag[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'BLOG' | 'MARKETPLACE' | 'BOTH';
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  authorId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
}

// Marketplace Types
export interface MarketplaceItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: Category;
  categoryId?: number;
  tags: Tag[];
  featured: boolean;
  stockCount?: number;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  item: MarketplaceItem;
  quantity: number;
  price: number;
}

// Testimonial Types
export interface Testimonial {
  id: number;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  image?: string;
  featured: boolean;
  createdAt: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response Wrapper
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BlogPostQuery extends PaginationParams {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  published?: boolean;
}

export interface MarketplaceQuery extends PaginationParams {
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
}

// Form Data Types
export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
  categoryIds?: number[];
  tagIds?: number[];
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: number;
}

export interface CreateMarketplaceItemData {
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  categoryId?: number;
  tagIds?: number[];
  stockCount?: number;
  sku?: string;
  featured?: boolean;
}

export interface UpdateMarketplaceItemData extends Partial<CreateMarketplaceItemData> {
  id: number;
}

// Contact Form
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'STRIPE' | 'PAYPAL';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Health Check
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

/**
 * Type Guards
 */

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
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
