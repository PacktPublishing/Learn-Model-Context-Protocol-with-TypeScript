# Run sample

## Install

```bash
npm install
```

## Start server

```bash
npm run start
```

You should see output similar to:

```text
> node ./build/index.js

MCP server listening on port 8000
```

## Start client

```bash
npm run client
```

You should see output similar to:

```text
Connected to MCP server with session ID: 370eef25-d43c-43e2-ba3f-d2e28a4bb60b
Available tools: { tools: [ { name: 'process-files', inputSchema: [Object] } ] }

Notification: info - File 1 processed
>
Notification: info - File 2 processed
>
Notification: info - File 3 processed
> Tool call result: {
  content: [ { type: 'text', text: 'All files processed: Process files' } ]
}
Client is ready to use.
```
