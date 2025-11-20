# Running this sample

There are two types of streaming servers available in this sample:

- SSE
- Streaming HTTP

## Install dependencies

```bash
npm install
```

## Run the SSE sample

Start the server:

```bash
npm run sse
```

Here's what you should see in the server console once the client is connected:

```text
> node ./build/streaming.js

HTTP streaming server running on port 8000
Streaming complete
```

In a separate terminal, start the client:

```bash
npm run sseclient
```

You should see output similar to this in the client console:

```text
> node ./build/client-sse.js

2025-06-01T15:10:43.193Z
2025-06-01T15:10:44.197Z
2025-06-01T15:10:45.205Z
2025-06-01T15:10:46.209Z
2025-06-01T15:10:47.211Z
2025-06-01T15:10:51.230Z
```

## Run the Streaming HTTP sample

Start the server:

```bash
npm run streaming-http
```

Here's what you should see in the server console once the client is connected:

```text
> node ./build/streaming-http.js
Streaming HTTP server running on port 8000
Streaming HTTP connection established
Sending Streaming HTTP data
```

In a separate terminal, start the client:

```bash
npm run client-streaming-http
```

You should see output similar to this in the client console:

```text
> node ./build/client-streaming.js

{"message":"Hello, world!"}

{"message":"Hello, world!"}

{"message":"Hello, world!"}

{"message":"Hello, world!"}

{"message":"Hello, world!"}
```
