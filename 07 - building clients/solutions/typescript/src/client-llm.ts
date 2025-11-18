import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";
import { z } from "zod"; 

import readline from 'node:readline';
import process from "node:process";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./build/index.js"]
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  }
);

const openai = new OpenAI({
    baseURL: "https://models.github.ai/inference", 
    apiKey: process.env.GITHUB_TOKEN,
});

const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 0. Add convert function
function toLLMTool(tool: {
    name: string;
    description?: string;
    inputSchema: any;
}) {
        // Create a zod schema based on the input_schema
        const schema = z.object(tool.inputSchema);
    
        return {
        type: "function" as const, // Explicitly set type to "function"
        function: {
            name: tool.name,
            description: tool.description,
            parameters: {
                type: "object",
                properties: tool.inputSchema.properties,
                required: tool.inputSchema.required,
            },
        },
        };
}

// function that calls MCP tool based on LLm response
async function callTools(
    tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: any[]
    ): Promise<void> {
    for (const tool_call of tool_calls) {
        const toolName = tool_call.function.name;
        const args = tool_call.function.arguments;

        console.log(`Calling tool "${toolName}" with args ${JSON.stringify(args)}`);


        // 2. Call the server's tool 
        const toolResult = await client.callTool({
            name: toolName,
            arguments: JSON.parse(args),
        });

        console.log("\nTool result: ", toolResult);

        // 3. Do something with the result
        // TODO  

    }
}

async function main() {
    await client.connect(transport);

    // List tools
    const tools = await client.listTools();

    

    let toolDescriptions = "";
    const llmTools = [];

    for(let tool of tools.tools) {
        toolDescriptions += `${tool.name}, ${tool.description}\n`;

        // 1. convert this response to LLM tool
        llmTools.push(toLLMTool(tool));
    }

    console.log("Welcome to E-shopping server");
    let keepRunning = true;

    while(keepRunning) {

        let command = await getInput("Provide user prompt (type h for help or quit to stop): ");
        console.log(command);

        if(command == "quit") {
            break;
        } else if(command == "h") {
            console.log("FEATURES");
            console.log(toolDescriptions);
        } else {

            // 2. take the command response as a user prompt to the LLM
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: "user",
                    content: command,
                },
            ];

            // 3. make LLM call
            console.log("Querying LLM: ", messages[0].content);

            let response = openai.chat.completions.create({
                model: "gpt-4o-mini",
                max_tokens: 1000,
                messages,
                tools: llmTools,
            });    
            // 4. read LLM response and call suitable MCP Server tool if any..
            let results: any[] = [];
        
            // 1. Go through the LLM response,for each choice, check if it has tool calls 
            for (const choice of (await response).choices) {
                const message = choice.message;
                if (message.tool_calls) {
                    console.log("Making tool call")
                    await callTools(message.tool_calls, results);
                }
            }
        }

    }
    read.close();
    
    console.log("Disconnected, Bye!");
    return;
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

