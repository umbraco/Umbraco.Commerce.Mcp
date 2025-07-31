import { z } from 'zod';

export const paginationRequestSchema = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20)
});

export const paginationSchema = paginationRequestSchema.extend({
    totalPages: z.number().int().min(0),
    totalItems: z.number().int().min(0)
});

export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
    return paginationSchema.extend({
        items: z.array(itemSchema)
    });
};

export type Pagination = z.infer<typeof paginationSchema>;
export type PaginatedResult<T> = Pagination &{
    items: T[];
};