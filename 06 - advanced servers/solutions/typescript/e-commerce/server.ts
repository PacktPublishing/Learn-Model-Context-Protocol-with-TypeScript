import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListToolsResult
} from "@modelcontextprotocol/sdk/types.js";

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

import tools from "./tools/index.js";
import { z, ZodObject, infer as ZodInfer } from "zod";


// Function to convert Zod schema to JSON Schema-like format
function zodToJsonSchema(zodSchema: ZodObject<any>): any {
    // Use _def.shape() to get the shape in recent Zod versions
    const shape = typeof zodSchema.shape === "function"
        ? zodSchema.shape()
        : (zodSchema._def && typeof zodSchema._def.shape === "function"
            ? zodSchema._def.shape()
            : zodSchema.shape);

    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const key in shape) {
        const def = shape[key];

        // Handle ZodString
        if (def instanceof z.ZodString) {
            properties[key] = { type: "string" };
        }
        // Handle ZodNumber
        else if (def instanceof z.ZodNumber) {
            properties[key] = { type: "number" };
        }
        // Handle ZodBoolean
        else if (def instanceof z.ZodBoolean) {
            properties[key] = { type: "boolean" };
        }
        // Handle nested ZodObject
        else if (def instanceof z.ZodObject) {
            properties[key] = zodToJsonSchema(def);
        }
        // Handle ZodArray
        else if (def instanceof z.ZodArray) {
            properties[key] = {
                type: "array",
                items: zodToJsonSchema(def._def.type)
            };
        }
        // Fallback
        else {
            properties[key] = { type: "string" };
        }

        // Check if field is required
        if (!def.isOptional()) {
            required.push(key);
        }
    }

    return {
        type: "object",
        properties,
        required,
    };
}

const EmptySchema = {
    type: "object",
    properties: {},
    required: []
}

export const server = new Server(
  {
    name: "example-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      tools: {}
    }
  }
);



server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { params: { name } } = request;

    // get tools by name, 
    let tool = tools.find(t => t.name === name);
    if (!tool) {
        return {
            error: {
                code: "tool_not_found",
                message: `Tool ${name} not found.`
            }
        };
    }

    // Use generics to infer the correct type from the inputSchema
    const Schema = tool.inputSchema;

    try {
        let input = {};
        if (Schema !== null) {
            input = Schema.parse(request.params.arguments);
        }

        // @ts-ignore
        const result = await tool.callback(input);

        return {
            content: [{ type: "text", text: `Tool ${name} called with arguments: ${JSON.stringify(input)}, result: ${JSON.stringify(result)}` }]
        };
    } catch (error) {
        return {
            error: {
                code: "invalid_arguments",
                message: `Invalid arguments for tool ${name}: ${error instanceof Error ? error.message : String(error)}`
            }
        };
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {

  interface Tool {
    name: string;
    description: string;
    inputSchema?: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
    };
  };  

  let toolsList: Tool[] = [];

  tools.forEach(tool => {
    toolsList.push({
      name: tool.name,
      description: tool.name,
      inputSchema: tool.inputSchema ? zodToJsonSchema(tool.inputSchema) : EmptySchema
    });
  });

  return {
    tools: toolsList
  };
});

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

// start server with npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/list
// npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/call --tool-name get_orders --tool-arg customerId=1