Here's an implementation of stdio

The client spawns up a child process (the server) and sends it messages with stdin. Server listens to `on("line")`, that is messages from the client and response by placing messages on stdout, e.g `console.log`.

How this works from an MCP standpoint is that Client:

- Send "initialize", to get server capabilities
- Send "notification/initialized", so server is initialized
- Send "tools/list" and gets a response on available tools

## Install

```sh
npm install
```

## Run

```sh
npm start
```

You should see an output like so:

```text
DEBUG Client starting server at: /..path../server.js
DEBUG Client sending data to server...
DEBUG Client received initialize response: {
  protocolVersion: '2024-11-05',
  capabilities: {
    logging: {},
    prompts: { listChanged: true },
    resources: { subscribe: true, listChanged: true },
    tools: { listChanged: true }
  },
  serverInfo: { name: 'ExampleServer', version: '1.0.0' }
}
DEBUG Client connected and initialized:
DEBUG CLIENT, Setting up listeners for child process...
DEBUG Client asks for tools list...
handleRpcMessage
{
  tools: [
    {
      name: 'ExampleTool',
      version: '1.0.0',
      description: 'An example tool for demonstration purposes.'
    }
  ]
}
```
