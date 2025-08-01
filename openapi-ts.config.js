import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    debug: true,
    input: `${process.env.UMBRACO_BASE_URL}/umbraco/swagger/commerce-management/swagger.json`,
    output: {
        path: "src/infrastructure/umbraco-commerce",
    },
    plugins: [
        {
            name: "@hey-api/client-fetch",
            exportFromIndex: true,
            throwOnError: true,
        },
        {
            name: "@hey-api/typescript",
            enums: "typescript",
        },
        {
            name: "@hey-api/sdk",
            asClass: true,
        },
        // 'zod'
    ],
});
