# Run sample

## Install dependencies

```bash
npm install
```

## Generate token

The idea is that you generate a JWT token that you can then validate. You can use the provided script to generate a token. The client can then use this token to authenticate against a resource server.

```bash
npm run generate
```

## Start server

```bash
npm run build
```

```bash
npm start
```

this should start the server.

## Start client

```bash
npm run client
```

From the terminal window running the server, you should see the text "Middleware executed" indicating that the middleware was executed to a finish which means the token was valid. Had it not been valid, you would have seen an error instead.

For the client, you should see an output similar to:

```text
$ npm run client

> client
> node ./build/client.js

Connected to MCP server with session ID: aac9bc50-6e90-4f21-b423-1d0cc980e66f
Available tools: { tools: [ { name: 'process-files', inputSchema: [Object] } ] }
Client disconnected.
Exiting...
```

This indicates the client was able to connect to the server and list the available tools, which means the token was valid and accepted by the server.

### Let's see what happens with an invalid token

In `client.ts`, change the token value to something invalid, e.g., change one character in the token string, locate this part of the code:

```typescript
let options: StreamableHTTPClientTransportOptions = {
  sessionId: sessionId,
  requestInit: {
    headers: {
      "Authorization": process.env.token || "secret123"
    }
  }
};
```

and change the value of the `Authorization` header to something invalid, e.g., `"secret123"`. You should now see the following output in the client terminal:

```text
Error initializing client: Error: Error POSTing to endpoint (HTTP 403): Forbidden
```

As you can see, your auth failed, and you were not able to connect to the server.

NOTE: you should keep improving this example, by validating the token signature, checking for expiration and of course check the scopes (i.e permissions), but this is left as an exercise for the reader. Now you have the basic idea of how to use JWT tokens for authentication and authorization in MCP and where to add the code. Also, you should NEVER create tokens like this in a real-world application, this is just for demonstration purposes. In a real-world application, you would use an IDP (Identity Provider) like for example Auth0, Keycloak, EntraID etc. 
