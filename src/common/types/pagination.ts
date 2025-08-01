import { z } from "zod";

export const paginationRequestSchema = z.object({
    cursor: z.string().optional(),
})

interface PaginationCursor {
    page: number;
    pageSize: number;
}

interface PaginatedResponse<T> {
    data: T[];
    nextCursor?: string;
}

interface ApiResponse<T> {
    data: T[];
    total: number;
}

class CursorPaginator 
{
    private defaultPageSize: number;

    constructor(defaultPageSize: number = 20) {
        this.defaultPageSize = defaultPageSize;
    }

    // Encode cursor
    private encodeCursor(page: number, pageSize: number): string {
        const cursor: PaginationCursor = { page, pageSize };
        return Buffer.from(JSON.stringify(cursor)).toString('base64');
    }

    // Decode cursor
    private decodeCursor(cursor: string): PaginationCursor {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    }

    // Generic pagination handler
    async paginate<T>(
        apiCall: (page: number, pageSize: number) => Promise<ApiResponse<T>>,
        options: {
            cursor?: string;
            pageSize?: number;
        } = {}
    ): Promise<PaginatedResponse<T>> {
        let page = 1;
        let pageSize = options.pageSize || this.defaultPageSize;

        // Decode cursor if provided
        if (options.cursor) {
            try {
                const decoded = this.decodeCursor(options.cursor);
                page = decoded.page;
                pageSize = decoded.pageSize;
            } catch (error) {
                // Invalid cursor, start from beginning
                page = 1;
            }
        }

        // Make API call
        const response = await apiCall(page, pageSize);

        // Determine if there are more results
        const hasMore = this.determineHasMore(response, page, pageSize);
        
        // Encode next cursor if there are more results
        const nextCursor = hasMore ? this.encodeCursor(page + 1, pageSize) : undefined;

        return {
            data: response.data,
            nextCursor
        };
    }

    private determineHasMore<T>(response: ApiResponse<T>, currentPage: number, pageSize: number): boolean 
    {
        return currentPage < Math.ceil(response.total / pageSize);
    }
}

export const paginator = new CursorPaginator(25);