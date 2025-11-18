

export const initializeMessage = {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    }
  }
};

export const initializedMessage = {
    "jsonrpc": "2.0",
    "method": "notifications/initialized",
    "params": {}
};

export const progressNotification = {
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "message": "Working on it..."
  }
};

export const listToolsMessage = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
};

const serverName = "ExampleServer";
const serverVersion = "1.0.0";

export let sampleResponse = {
  model: "gpt-4o",  // Name of the model used
  stopReason: "endTurn",
  role: "assistant",
  content: {
    type: "text",
    text: ""
  }
}

export let listToolsResponse = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "tools": [
            {
                "name": "ExampleTool",
                "version": "1.0.0",
                "description": "An example tool for demonstration purposes.",
            }
        ]
    }
};

export const initializeResponse = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
            "logging": {},
            "prompts": {
                "listChanged": true
            },
            "resources": {
                "subscribe": true,
                "listChanged": true
            },
            "tools": {
                "listChanged": true
            }
            },
            "serverInfo": {
            "name": serverName,
            "version": serverVersion
            }
        }
};
export const errorResponse = {
    "jsonrpc": "2.0",
    "id": 1,
    "error": {
        "code": -32600,
        "message": "Invalid Request"
    }
};
