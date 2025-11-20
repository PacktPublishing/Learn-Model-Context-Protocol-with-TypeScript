import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const server = new McpServer({
  name: "backwards-compatible-server",
  version: "1.0.0"
});


const products = [{
  id: 1,
  name: "Red ridinghood",
  category: "books" 
},
{
  id: 2,
  name: "Three musketeers",
  category: "books" 
},
{
  id: 3,
  name: "White album",
  category: "music" 
}]

let cart: typeof products = []

// Add a tool
server.tool(
  "products",
  "get products by category",
  { 
    category: z.string().optional() 
  },
  async ({ category }) => {
    category = String(category).toLowerCase();
    console.log("Server: ", category);

    let filteredProducts = category ? products.filter(p => p.category === category): products;

    return {
      content: [{ type: "text", text: filteredProducts.map(p => p.name).join(",") }]
    };
  }
);

server.tool(
  "cart-list",
  "get products in cart",
  {},
  async () => {
    return {
      content: [{ type: "text", text: cart.map(p => p.name).join(", ") || "Cart is empty" }]
    };
  }
);

server.tool(
  "cart-add",
  "Adding products to cart",
  { 
    title: z.string().optional()
  },
  async ({ title }) => {
    title = String(title).toLowerCase();
    // TODO, use the input that's present, if neither is present answer with error
    let foundProduct = products.find(p => p.name.toLowerCase().startsWith(title));

    let response = foundProduct ? `Added ${foundProduct.name} to cart` : `Product not found`;
    if (foundProduct) {
      // TODO, use the input that's present, if neither is present answer with error
      cart.push(foundProduct);
    }

    return {
      content: [{ type: "text", text: response }]
    };
  }
);

const app = express();
app.use(express.json());

// Store transports for each session type
const transports = {
  sse: {} as Record<string, SSEServerTransport>
};

app.get('/sse', async (req, res) => {
  // Create SSE transport for legacy clients
  const transport = new SSEServerTransport('/messages', res);
  transports.sse[transport.sessionId] = transport;
  
  res.on("close", () => {
    delete transports.sse[transport.sessionId];
  });
  
  await server.connect(transport);
});

// Legacy message endpoint for older clients
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.sse[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    console.log("SSE endpoint: http://localhost:3000/sse");
    console.log("Legacy message endpoint: http://localhost:3000/messages");
});
