import { defineConfig } from "@hey-api/openapi-ts";

import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    debug: true,
    input: `${process.env.UMBRACO_BASE_URL}/umbraco/swagger/commerce-management/swagger.json`,
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
        // 'zod'
    ],
});
