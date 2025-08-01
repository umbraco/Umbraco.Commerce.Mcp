import {z} from "zod";

export const envSchema = z.object({
    UMBRACO_CLIENT_ID: z.string(),
    UMBRACO_CLIENT_SECRET: z.string(),
    UMBRACO_BASE_URL: z.string().url(),
});