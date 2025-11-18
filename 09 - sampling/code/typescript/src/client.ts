import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CreateMessageRequestSchema
} from "@modelcontextprotocol/sdk/types.js";


import readline from 'node:readline';
import process from "node:process";

import { callLLM } from "./llm.js"

const transport = new StdioClientTransport({
  command: "node",
  args: ["./build/index.js"]
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  },
  {
    capabilities: {
        sampling: {},
    }
  },
);

const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// llm function should take prompt and system message


client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
    // todo, parse out name and keywords
    console.log("[CLIENT]: ", request);

    let prompt = request.params.messages[0].content.text;

    let llmResponse = await callLLM(prompt as string, "You are a helpful assistant that generates product descriptions.");

    // Mock implementation of createMessage
    return {
      model: "gpt-4o",
      role: "assistant",
      content: {
        type: "text",
        text: `Client LLM: ${llmResponse}`,
      },
    };
});

async function main() {
    await client.connect(transport);

    // List tools
    const tools = await client.listTools();

    let toolDescriptions = "";

    for(let tool of tools.tools) {
        toolDescriptions += `${tool.name}, ${tool.description}\n`;
    }

    // call create_product

    const result = await client.callTool({
        name: "create_product",
        arguments: {
            "name": "tomato",
            "keywords": "red, juicy"
        }
    });

    console.log("create_product::RESULT");
    console.log(result);

    // get products
    const products = await client.callTool({
        name: "get_products",
        arguments: {}
    });

    console.log("get_products::RESULT");
    console.log(products);

   
}

function getInput(query: string): Promise<string> {
    return new Promise(resolve => {
        read.question(query, (answer: string) => {
            resolve(answer);
        });
    });
}

main().catch((error) => {
    console.error("Error: ", error);
    
});


