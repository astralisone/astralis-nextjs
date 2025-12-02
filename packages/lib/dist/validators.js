import { z } from 'zod';
/**
 * Common validation schemas
 */
export const idSchema = z.string().min(1, 'ID is required');
export const orgIdSchema = z.string().min(1, 'Organization ID is required');
export const emailSchema = z.string().email('Invalid email address');
export const nameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const sortSchema = z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
