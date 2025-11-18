import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

import { z } from "zod";

import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  LoggingMessageNotificationSchema,
  ListToolsResult,
  RequestSchema,
  ResultSchema,
  NotificationSchema
} from "@modelcontextprotocol/sdk/types.js";

const ProductResultSchema = ResultSchema.extend({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    stock: z.number(),
});

type ProductResult = z.infer<typeof ProductResultSchema>;


const transport = new SSEClientTransport(new URL("http://localhost:3000/sse"));
transport.onerror = (error) => {
  console.error("Transport error:", error);
};

transport.onmessage = (message) => {
    console.log("Received message:", message);
};

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  },
  {
    capabilities: {
        experimental: {},
        sampling: {},
        logging: {},
    }
  }
);

async function start() {
    console.log("Connecting to server...");
    await client.connect(transport);

    // @ts-ignore, overwrite the onmessage handler to handle messages from the server
    // client._transport.onmessage = (message) => {
    //     console.log("Client received message:", message);
    // };


    client.setNotificationHandler(LoggingMessageNotificationSchema, (notification) => {
      console.log(`\nNotification: ${notification.params.level} - ${notification.params.data}`);
      
    });

    let tools = await client.listTools();
    console.log("Available tools:", tools);

    let result: ProductResult = await client.request(
        {
            method: "product/get",
            params: {
                id: "1"
        }
    },
        ProductResultSchema,
        {},
    );

    console.log("Product result:", result);
    console.log("Product name:", result.name);

    // await transport.send({
    //     jsonrpc: "2.0",
    //     method: "product/get",
    //     params: {
    //         id: "1"
    //     }
    // });

    let pingResult = await client.ping();
    console.log("Ping result:", pingResult);

}

start();


