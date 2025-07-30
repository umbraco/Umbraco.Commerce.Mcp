import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    debug: true,
    input: "https://localhost:44322/umbraco/swagger/commerce-management/swagger.json",
    output: {
        path: "src/api",
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
        'zod'
    ],
});
