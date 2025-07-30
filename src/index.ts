import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { client } from "./api/index.js";
import { createUmbracoAuthPlugin } from "./plugins/umbraco-auth.plugin.js";

// The main execution loop
const main = async () => {
    
    // Create the MCP server
    const server = new McpServer({
        name: "umbraco-commerce-mcp-server",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });
    
    // Create an umbraco auth client plugin
    const authPlugin  = createUmbracoAuthPlugin({
        host: process.env.UMBRACO_BASE_URL!,
        clientId: process.env.UMBRACO_CLIENT_ID!,
        clientSecret: process.env.UMBRACO_CLIENT_SECRET!
    });

    // Install the plugin - this sets up everything
    authPlugin.install(client);
    
    // Register all tools and resources


    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
};

// Global error handling
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});