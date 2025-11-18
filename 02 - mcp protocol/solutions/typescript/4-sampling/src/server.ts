// SERVER CODE

import readline from 'readline';
import { 
    getJsonRpcMessage, 
    isJsonRpcMessage,
    isSampleResponse
} from './utils/helpers.js';
import { initializeResponse, listToolsResponse, errorResponse, progressNotification } from './utils/messages.js';
import { EventEmitter } from 'stream';

let initialized = false;

// TODO, sampling, if tool call request, respond with empty response, but also produce a sampling message

class Product {
    id: number;
    name: string;
    price: number;
    keywords: string[];

    constructor(id: number, name: string, price: number, keywords: string[]) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.keywords = keywords;
    }
}

class ExternalService {
    map: { [key: string]: Function[] } = {}
    currentIndex = 0;

    products: Product[] = [
        new Product(1, 'Cable, 3M', 100, ['electronics', 'gadgets']),
        new Product(2, 'Stereo', 150, ['home', 'appliances']),
        new Product(3, 'Jacket', 200, ['outdoors', 'sports']),
    ];
    constructor() {
        // Simulate some external service that emits events
        let id = setInterval(() => {
            if(this.currentIndex < this.products.length) {
                this.emit('new-product', this.products[this.currentIndex]);
                this.currentIndex++;
            } else {
                clearTimeout(id);
            }
        }, 1000);
    }

    emit(event: string, data) {
        if (this.map[event]) {
            this.map[event].forEach(listener => listener(data));
        }
    }

    
    addListener(event, listener: Function) {
        if (!this.map[event]) {
            this.map[event] = [];
        }
        this.map[event].push(listener);
    }

    removeListener(event, listener) {
        if (this.map[event]) {
            this.map[event] = this.map[event].filter(l => l !== listener);
        }
    }

        
}

let tools = [
    {
        name: "ExampleTool",
        version: "1.0.0",
        description: "An example tool for demonstration purposes.",
        inputSchema: {
            type: "object",
            properties: {
                "arg1": {
                    type: "number",
                    description: "The first argument for the tool."
                },
                "arg2": {
                    type: "number",
                    description: "The second argument for the tool."
                }
            },
            required: ["arg1", "arg2"]
        },
        handler: async (args) => {
            // Simulate some processing
            return new Promise((resolve) => {
                resolve(args.arg1 + args.arg2);
            });
        }
    }
];

function listenToExternalService() {
    const externalService = new ExternalService();
    externalService.addListener('new-product', (product: Product) => {
        // create the sampling message
        let samplingMessage = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sampling/createMessage",
            "params": {
                "messages": [{
                    "role": "system",
                    "content": {
                        "type": "text",
                        "text": `New product available: ${product.name} (ID: ${product.id}, Price: ${product.price}). Keywords: ${product.keywords.join(', ')}`
                    }
                }],
                "systemPrompt": "You are a helpful assistant assisting with product descriptions",
                "includeContext": "thisServer",
                "maxTokens": 300
            }
        };
        // send the sampling message to the console
        console.log(JSON.stringify(samplingMessage));
    });
}

function createListToolsResponse() {
    let toolsWithoutHandler = tools.map(tool => {
        return {
            name: tool.name,
            version: tool.version,
            description: tool.description,
            inputSchema: tool.inputSchema
        };
    });

    return {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "tools": toolsWithoutHandler
        }
    };
}

function createToolCallResponse(toolName, result) {
    return {
        "jsonrpc": "2.0",
        "id": 1,
        "result" : {
            "content":[
                {
                    "type": "text",
                    "text": `Tool ${toolName} returned ${result + ""}`
                }
            ]
        }
    };
}

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout,
 terminal: false
});

rl.on('line', async (line) => {
 if (line.includes('exit')) {
   console.log('EXIT received: Server closing down...');
   process.exit(0);
 } else {
   if(initialized) {
     if(isJsonRpcMessage(line)) {
       let message = getJsonRpcMessage(line);
       switch(message.method) {
            case "tools/list":
                console.log(JSON.stringify(progressNotification) + "\n");

                console.log(JSON.stringify(createListToolsResponse()) + "\n");
                break;
            case "tools/call":
                let toolName = message.params.name;
                let toolArgs = message.params.arguments;
                let tool = tools.find(t => t.name === toolName);
                // console.log("DEBUG Server calling tool:", toolName, "with args:", toolArgs);

                let result = await tool?.handler(toolArgs);
                
                // TODO add validation, ensure arguments match the input schema
                console.log(JSON.stringify(createToolCallResponse(toolName, result)));
                break;
            default:
                console.error("Server received an unknown method:", message.method);
                break;
        }
     } else {
         if(isSampleResponse(line)) {
            // handle sampling response
            // i.e log it, cache it
        } else {
            console.log(JSON.stringify(errorResponse), line);
        }
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
              // start listening to external service now that the server-client connection is initialized
              listenToExternalService();
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







