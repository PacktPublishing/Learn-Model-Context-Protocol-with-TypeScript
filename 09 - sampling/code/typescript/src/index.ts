import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

type Product = {
  name: string;
  keywords: string;
  description: string;
};

let products: Product[] = [];

server.tool("get_products", {
  // Define input schema
}, async () => {
  // Mock implementation
  let result = products.map(product => ({
    type: "text",
    text: `Product: ${product.name}, Keywords: ${product.keywords}, Description: ${product.description}`
  } as {
    type: "text";
    text: string;
  } ));
  return {
    content: result
  };
});

// create product
server.tool("create_product",
  { name: z.string(), keywords: z.string() },
  async ({ name, keywords }) => {

    // 1. create and run sample request
    let product: Product = { name, keywords, description: "" };

    let prompt = `Generate a compelling product description, with name: ${name} and keywords: ${keywords}`;

    const response = await server.server.createMessage({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: prompt,
          },
        },
      ],
      maxTokens: 500,
    });

    product.description = response.content.text as string;
    products.push(product);

    return {
        content: [
            { type: "text", text: `Created product: ${product.name}, ${product.keywords}, ${product.description}` }
        ]
    };
});


// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);