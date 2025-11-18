
// CLIENT CODE

import { spawn } from 'child_process';
import EventEmitter, { on } from 'node:events';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeMessage, initializedMessage, listToolsMessage, sampleResponse } from "./utils/messages.js";
import { 
    isJsonRpcMessage, 
    getRpcMessage, 
    isInitializeResponseMessage,
    isNotificationMessage 
} from "./utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverPath = join(__dirname, 'server.js');
console.log("DEBUG Client starting server at:", serverPath);


const child = spawn('node', [serverPath]);

let initialized = false;

// Listen for data from the child

let onmessage: Function | null = null;
let onsampling: Function | null = null;
let onerror: Function | null = null;
let onnotification: Function | null = null;

function handleRpcMessage(data) {
    let message = getRpcMessage(data.toString().trim());
    if (message.method && message.method.startsWith("sampling/")) {
        onsampling?.(message);
        
        return;
    } else if(message.result) {
        onmessage?.(message.result);
        // If the message has a result, it is a response to a request
        
    } else if (message.method && message.method.startsWith("notifications/")) {
        onnotification?.(message);
    } else {
        console.log(`CLIENT::ondata> (FROM SERVER): Unrecognized message: ${data.toString().trim()}`);
    }  
}

function _handleMessageResponse(): Promise<void> {
    return new Promise((resolve, reject) => {
        // we need to tell it to resolve when we get the response
        
        function handleMessage(data) {
            const message = data.toString().trim();
            if (!isNotificationMessage(message)) {
                const json = getRpcMessage(message);
                
                // TODO add null check

                resolve(json?.result);

                child.stdout.removeListener('data', handleMessage); // remove listener after handling the message

            } else {
                // Notification do nothing, let other handlers take care of it
                // keep listener here as we got a nofication and we're still waiting for the response     }
            }
        }


        child.stdout.on('data',handleMessage);
    });
}

function _makeRequest(message: any) {
    child.stdin.write(_serializeMessage(message));
}

function _serializeMessage(message: any): string {
    return JSON.stringify(message) + "\n";
}

async function listTools(): Promise<void> {
    _makeRequest(listToolsMessage);

    return _handleMessageResponse();
}

async function callTool(toolName: string, args: any): Promise<void> {
    const toolMessage = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
            name: toolName,
            arguments: args
        },
        id: Math.floor(Math.random() * 1000) // Random ID for the request
    };
    _makeRequest(toolMessage);
    return _handleMessageResponse();
}

async function connect(): Promise<void> {
  // sending data to the server
  console.log("DEBUG Client sending data to server...");
  _makeRequest(initializeMessage);

    return new Promise((resolve, reject) => {
        child.stdout.once('data', (data) => {
            const message = data.toString().trim();
            if (isJsonRpcMessage(message)) {
                const json = getRpcMessage(message);
                if (isInitializeResponseMessage(json)) {
                    console.log("DEBUG Client received initialize response:", json.result);
                    
                    _makeRequest(initializedMessage);
                    console.log("DEBUG Client connected and initialized:");
                    initialized = true;
                    setupListeners();
                    resolve();
                } else {
                    reject(new Error("Unexpected message received during initialization."));
                }
            } else {
                reject(new Error("Invalid JSON RPC message received during initialization."));
            }
        });
    });
} 

function setupListeners() {
    child.stdout.resume(); // kick it back into action
    console.log("DEBUG CLIENT, Setting up listeners for child process...");
    child.stdout.on('data', (data) => {
        
        if(isJsonRpcMessage(data.toString().trim())) {
            handleRpcMessage(data);
        } else {
            // TODO, handle this better, notifications come here too
            console.log(`setupListener: Unrecognized message: ${data.toString().trim()}`);
        }
    });

    // Optionally handle errors
    child.stderr.on('data', (data) => {
      console.error(`Client::onerror> (FROM SERVER): ${data}`);
    });

    // Handle child process exit
    child.on('exit', (code) => {
      console.log(`Client::onexit> (FROM SERVER): SERVER exited with code ${code}`);
    });
}

async function main() {
    // just to keep track of all messages, responses and notifications
    // onmessage = (message) => {
    //     console.log("MESSAGE RECEIVED:", message);
    // }

    onnotification = (message) => {
        console.log("NOTIFICATION RECEIVED:", message);
        
    };

    onsampling = (message) => {
        console.log("SAMPLING RECEIVED:", message);
        console.log(message.params.messages[0].content.text);
        // call your LLM, product response back to server
        createSampleResponse(message.params.messages[0].content.text);
    };

    await connect();
    // After connection, you can start sending messages
    let toolResponse = await listTools();
    console.log("Tools response:", toolResponse);

    let toolResult = await callTool("ExampleTool", { arg1: 5, arg2: 10 });
    console.log("Tool call result:", toolResult);
}

async function createSampleResponse(message: string) {
  const llmResponse = await callLLM(message);
  // make copy sampleResponse to avoid mutating the original
  const copy = { ...sampleResponse };
  copy.content.text = llmResponse;

  _makeRequest(sampleResponse);
}

async function callLLM(message: string): Promise<string> {
    return Promise.resolve(`LLM response to: ${message}`);
}
    

main();

