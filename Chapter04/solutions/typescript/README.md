# Running sample

Here are instructions to run the sample.

## -1- Install the dependencies

```bash
npm install
```

## -3- Build the sample

```bash
npm run build
```

## -4- Test the sample

With the server running in one terminal, open another terminal and run the following command:

```bash
npm run inspector
```

This will open a browser window with the inspector running.

Fill in the following fields:

- **Transport type**: SSE
- **URL**: http://localhost:3000/sse

Try listing and running the tools.

### Testing in ClI mode


```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/list
```

This will list all the tools available in the server. You should see the following output:

```text
{
  "tools": [
    {
      "name": "products",
      "description": "get products by category",
      "inputSchema": {
        "type": "object",
        "properties": {
          "category": {
            "type": "string"
          }
        },
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "cart-list",
      "description": "get products in cart",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "cart-add",
      "description": "Adding products to cart",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          }
        },
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    }
    
  ]
}
```

To invoke a tool type:

```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/call --tool-name cart-list 
```

You should see the following output:

```text
{
  "content": [
    {
      "type": "text",
      "text": "Cart is empty"
    }
  ]
}
```

> ![!TIP]
> It's usually a lot faster to run the ispector in CLI mode than in the browser.
> Read more about the inspector [here](https://github.com/modelcontextprotocol/inspector).
