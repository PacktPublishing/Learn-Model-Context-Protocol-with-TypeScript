
// CLIENT CODE

import { spawn } from 'child_process';
import EventEmitter from 'node:events';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeMessage, initializedMessage, listToolsMessage } from "./utils/messages.js";
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
let onerror: Function | null = null;

// TODO: this should just console.log if we implement `onmessage`
function handleRpcMessage(data) {
    // console.log("handleRpcMessage");

    let message = getRpcMessage(data.toString().trim());
    if (!message) {
        onmessage?.(data);
        // console.error("Invalid JSON RPC message received:", data);
        return;
    }
    if(message.result) {
        onmessage?.(message.result);
        // If the message has a result, it is a response to a request
        // console.log("DEBUG Client received response:", message.result);
    } else {
        onmessage?.(message);
        // for notifications, we just log the message
        // console.log("DEBUG Client received notification:", message);
    }
   
}

function callTool(toolName: string, args: any[]): Promise<any> {
    let toolMessage = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": toolName,
            "args": args
        },
        "id": 1
    };


    child.stdin.write(JSON.stringify(toolMessage) + "\n");

    return new Promise((resolve, reject) => {
        function handleMessage(data) {
            const message = data.toString().trim();
            if (!isNotificationMessage(message)) {
                const json = getRpcMessage(message);
                resolve(json.result);

                child.stdout.removeListener('data', handleMessage);
            }
        }

        child.stdout.on('data', handleMessage);
    });
}


function listTools(): Promise<void> {
    child.stdin.write(JSON.stringify(listToolsMessage) + "\n");

    return new Promise((resolve, reject) => {
        // we need to tell it to resolve when we get the response
        
        function handleMessage(data) {
            const message = data.toString().trim();
            if (!isNotificationMessage(message)) {
                const json = getRpcMessage(message);
                
                // show response
                // console.log(json.result);
                resolve(json.result);

                child.stdout.removeListener('data', handleMessage); // remove listener after handling the message

            } else {
                // Notification do nothing, let other handlers take care of it
                // keep listener here as we got a nofication and we're still waiting for the response     }
            }
        }


        child.stdout.on('data',handleMessage);
    });
}

async function connect(): Promise<void> {
  // sending data to the server
  console.log("DEBUG Client sending data to server...");
  child.stdin.write(JSON.stringify(initializeMessage) + "\n");

    return new Promise((resolve, reject) => {
        child.stdout.once('data', (data) => {
            const message = data.toString().trim();
            if (isJsonRpcMessage(message)) {
                const json = getRpcMessage(message);
                if (isInitializeResponseMessage(json)) {
                    console.log("DEBUG Client received initialize response:", json.result);
                    child.stdin.write(JSON.stringify(initializedMessage) + "\n");
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
            console.log(`CLIENT::ondata> (FROM SERVER): Unrecognized message: ${data.toString().trim()}`);
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

    await connect();
    // After connection, you can start sending messages
    let toolResponse = await listTools();
    console.log("Tools response:", toolResponse);
    let callToolResponse = await callTool("exampleTool", ["arg1", "arg2"]);
    console.log("Call tool response:", callToolResponse);
    let items = callToolResponse.properties.content.items;
    for (let item of items) {
        console.log("Item:", item.text);
    }
}

main();

