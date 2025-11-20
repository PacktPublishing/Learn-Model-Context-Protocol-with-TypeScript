import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListToolsResult,
  RequestSchema,
  ResultSchema,
  NotificationSchema
} from "@modelcontextprotocol/sdk/types.js";

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

import { z, ZodObject, infer as ZodInfer } from "zod";

let transport: SSEServerTransport;


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


const ProductNotificationSchema = NotificationSchema.extend({
    method: z.literal("product/alert"),
    params: z.object({
      message: z.string(),
    }),
  });

const ProductResultSchema = ResultSchema.extend({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    stock: z.number(),
  });

const GetProductInputSchema = z.object({
    id: z.string()
});

const GetProductRequestSchema = RequestSchema.extend({
    method: z.literal("product/get"),
    params: z.object({
      id: z.string(),
    }),
  });

const GetProductsRequestSchema = RequestSchema.extend({
    method: z.literal("product/list"),
    params: z.object({
      category: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
});

const ProductRequestSchema = GetProductRequestSchema.or(
    GetProductsRequestSchema
);

type ProductRequest = z.infer<typeof ProductRequestSchema>;
type ProductResult = z.infer<typeof ProductResultSchema>;
type ProductNotification = z.infer<typeof ProductNotificationSchema>;

export const server = new Server<ProductRequest, ProductNotification, ProductResult>(
  {
    name: "example-server",
    version: "1.0.0"
  },
  {
     capabilities: {
        prompts: {},
        resources: {},
        tools: {},
        logging: {},
      },
      enforceStrictCapabilities: true
  },
);



server.setRequestHandler(
  GetProductRequestSchema,
  async (request, { sendNotification }) => {
    console.log("Received request:", request);

    console.log("notification handler", sendNotification);
    await sendNotification({
        method: "notifications/message",
        params: { level: "info", data: `buy this product` }
    });

    const { params: { id } } = request; 
    // Simulate fetching product data
    const product = {
      id,
      name: `Product ${id}`,
      price: Math.floor(Math.random() * 100) + 1,
      description: `Description for product ${id}`,
      category: "Category A",
      stock: Math.floor(Math.random() * 100) + 1,
    };
    return product;
  }
);

server.setRequestHandler(
  ListToolsRequestSchema,
  async () => {
    const tools: ListToolsResult = {
      tools: [
        {
          name: "get_product",
          description: "Get product details by ID",
          inputSchema: zodToJsonSchema(GetProductInputSchema)
        }
      ]
    };
    return tools;
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
  transport = new SSEServerTransport('/messages', res);
  transports.sse[transport.sessionId] = transport;

 

  res.on("close", () => {
    delete transports.sse[transport.sessionId];
  });
  
  await server.connect(transport);

  // we really should send this after the connection is established
//   setTimeout(async() => {


//   transport.on("connect", (session) => {
//     console.log(`Client connected: ${session.sessionId}`);

//      // TODO, send product alert notification, this item is on sale!
//     // await transport.send({
//     //     jsonrpc: "2.0",
//     //     method: "product/alert",
//     //     params: {
//     //     message: "This item NN is on sale!"
//     //     }
//     // });
//   });

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

// npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method product/get

// npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/call --tool-name get_orders --tool-arg customerId=1

// npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/call --tool-name get_orders --tool-arg customerId=1