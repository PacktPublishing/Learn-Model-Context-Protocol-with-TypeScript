
// CLIENT CODE

import { spawn } from 'child_process';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeMessage, initializedMessage, listToolsMessage } from "./utils/messages.js";
import { isJsonRpcMessage, getRpcMessage, isInitializeResponseMessage } from "./utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverPath = join(__dirname, 'server.js');
console.log("DEBUG Client starting server at:", serverPath);


const child = spawn('node', [serverPath]);

let initialized = false;

// Listen for data from the child

function handleRpcMessage(data) {
    console.log("handleRpcMessage");

    let message = getRpcMessage(data.toString().trim());
    if (!message) {
        console.error("Invalid JSON RPC message received:", data);
        return;
    }

    console.log(message.result);
}

function listTools() {
    console.log("DEBUG Client asks for tools list..."); 
    child.stdin.write(JSON.stringify(listToolsMessage) + "\n");
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
    await connect();
    // After connection, you can start sending messages
    listTools();
}

main();

