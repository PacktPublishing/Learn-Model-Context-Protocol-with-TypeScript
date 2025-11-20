// SERVER CODE

import readline from 'readline';
import { getJsonRpcMessage, isJsonRpcMessage } from './utils/helpers.js';
import { initializeResponse, listToolsResponse, errorResponse, progressNotification } from './utils/messages.js';

let initialized = false;

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout,
 terminal: false
});

rl.on('line', (line) => {
 if (line.includes('exit')) {
   console.log('EXIT received: Server closing down...');
   process.exit(0);
 } else {
   if(initialized) {
     if(isJsonRpcMessage(line)) {
       let message = getJsonRpcMessage(line);
       switch(message.method) {
            case "tools/list":
                console.log(JSON.stringify(progressNotification));
                console.log(JSON.stringify(listToolsResponse));
                break;
            default:
                console.log(JSON.stringify(errorResponse));
                break;
        }
     } else {
       console.log(JSON.stringify(errorResponse));
     }
   } else { // not initialized
        if(isJsonRpcMessage(line)) {
          let message = getJsonRpcMessage(line);
          switch(message.method) {
            case "initialize":
              console.log(JSON.stringify(initializeResponse));
              break;
            case "notifications/initialized":
              initialized = true;
              break;
            default:
              console.log("Server not initialized, only initialize or notifications/initialized methods are supported at this point: ", message.method);
          }
        } else {
          console.error("Invalid JSON-RPC message received:", line);
        }
      }
   }
});







