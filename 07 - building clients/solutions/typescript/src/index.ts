import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

/* 
- Ask for products of a certain category.
- Adding products to the cart all done using natural language.
*/

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