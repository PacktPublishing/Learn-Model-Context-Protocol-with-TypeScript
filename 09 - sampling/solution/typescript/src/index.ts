import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { get } from "node:http";
import "node:process";
import "node:path";
import path from "node:path";

let src = path.join(process.cwd(), "../", "characters.json");
let characters = JSON.parse(readFileSync(src, "utf-8"));
 
// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});


function getCharacterByName(name: string) {
  return characters.find((char: any) => char.name === name);
}

server.tool("talk_to",
  { name: z.string(), topic: z.string() },
  async ({ name, topic }) => {

    // 0. get character by name, get their description and personality
    let character = getCharacterByName(name);

    // 1. create and run sample request
    let prompt = `You are ${character["name"]}, ${character["description"]}. Your personality is ${character["personality"]}. Respond to the topic: ${topic}`;

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
      maxTokens: 500
    });

    console.log("sample response", response);


    return {
        content: [
            { type: "text", text: `Client response: ${response.content.text}` }
        ]
    }
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