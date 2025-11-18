import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
    
// Create an MCP server
const server = new McpServer({
    name: "Demo",
    version: "1.0.0"
});


server.tool("multiply",
    { first: z.number(), second: z.number() },
    async ({ first, second }) => ({
        content: [{ type: "text", text: String(first * second) }]
    })
);

server.resource("echo", new ResourceTemplate("echo://{message}", { list: () => {
    // list all resources matching the template
    return {
        resources: [
            {
                "name": "echo",
                "description": "Echo a message",
                "mimeType": "text/plain",
                "uri": "echo://{message}"
            }
        ]
    };
    } }), 
    async (uri, { message }) => ({
        contents: [{
            uri: uri.href,
            text: `Resource echo: ${message}`
        }]
    }));

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCPServer started on stdin/stdout");
}
main().catch((error) => {
    console.error("Fatal error: ", error);
    process.exit(1);
});
