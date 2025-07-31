import {z} from "zod";

export const envSchema = z.object({
    UMBRACO_CLIENT_ID: z.string(),
    UMBRACO_CLIENT_SECRET: z.string(),
    UMBRACO_BASE_URL: z.string().url(),
});

export const toolModuleSchema = z.object({
    default: z.object({
        name: z.string()
            .min(1, 'Tool name is required'),
        description: z.string()
            .min(1, 'Tool description is required'),
        inputSchema: z.any().optional(), // Schema can be any Zod shape
        outputSchema: z.any().optional(), // Schema can be any Zod shape
        handler: z.function()
            .args(z.any(), z.any())
            .returns(z.any()),
        isAllowed: z.function()
            .args(z.any())
            .returns(z.boolean())
            .optional(),
    }).strict() // Don't allow unknown properties on the tool definition
}).passthrough(); // But allow additional exports from the module