


export function isInitializedMessage(message: string): boolean {
    // use getJsonRpcMessage to parse the message
    const json = getJsonRpcMessage(message);
    return json && json.jsonrpc === "2.0" && json.method === "initialized";
}

export function isInitializeMessage(message: string): boolean {
  // use getJsonRpcMessage to parse the message
  const json = getJsonRpcMessage(message);
  return json && json.jsonrpc === "2.0" && json.method === "initialize";
}

export function getJsonRpcMessage(message: string): any | null {
  try {
    return JSON.parse(message);
  } catch (error) {
    console.error("Invalid JSON-RPC message:", error);
    return null;
  }
}

export function isSampleResponse(message): boolean {
  const json = getJsonRpcMessage(message);
  return json && json.model;
}

export function getRpcMessage(message: string): any | null {
  try {
    const json = JSON.parse(message.trim());
    return json.jsonrpc === "2.0" ? json : null;
  } catch (error) {
    console.error("Error parsing JSON RPC message:", error, message);
    return null;
  }
}

export function isInitializeResponseMessage(json: any): boolean {
  // check results.capabilities
  return json && json.result.capabilities;
}

export function isJsonRpcMessage(message: string): boolean {
  const json = getRpcMessage(message);
  return json !== null;
}

export function isNotificationMessage(message: string): boolean {
  // console.log(message);
  const json = getJsonRpcMessage(message);
  return json && json.method && json.method.startsWith("notifications/");
}
