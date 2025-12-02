import { z } from 'zod';
/**
 * Common validation schemas
 */
export declare const idSchema: z.ZodString;
export declare const orgIdSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const sortSchema: z.ZodObject<{
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map