import z from "zod";

export const storeIdOrAliasRequestSchema = z.object({
    storeIdOrAlias: z.string().describe("The store ID or alias to use for the request. This can be either the actual store ID or an alias that maps to a specific store."),
});