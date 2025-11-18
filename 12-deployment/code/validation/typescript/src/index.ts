import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, ZodRawShape, ZodObject } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js"

// Create an MCP server
const server = new Server({
  name: "demo-server",
  version: "1.0.0"
},{
    capabilities: {
      tools: {}
    }
});

let AddToolInputSchema = z.object({
  a: z.number(),
  b: z.number()
});

type AddInputType = z.infer<typeof AddToolInputSchema>;

let tools = [
    {
      "name": "add",
      "description": "Adds two numbers",
      "inputSchema": {
        "type": "object",
        "properties": {
          "a": { "type": "number" },
          "b": { "type": "number" }
        },
        "required": ["a", "b"]
      }, 
      "schema": AddToolInputSchema,
      "callback": async (input) => {
        let args = input as z.infer<typeof AddToolInputSchema>;
        const { a, b } = args;
        return a + b;
      }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: tools
  }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { method, params: { name }} = request;
 
  let tool = tools.find(t => t.name === name);

  if (tool) {
    try {
      let schema = tool.schema as ZodObject<ZodRawShape>;
      let input = schema.parse(request.params.arguments);
      let result = await tool.callback(input);
      return {
        content: [{ type: 'text', text: `Result ${result}` }]
      };
    } catch(a) {
      throw new Error(`Failed to parse input: ${a}`);
    }

    
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.log("MCP server is running...");
