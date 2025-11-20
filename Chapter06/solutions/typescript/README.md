# Running this server

## Install dependencies

Start by navigating into *e-commerce folder*

```sh
cd e-commerce
```

Install the dependencies

```sh
npm install
```

## Test it out

Compile the server with the command:

```sh
npm run build
```

Start the server with the command:

```sh
npm start
```

In a separate terminal, run the command:

```sh
npx @modelcontextprotocol/inspector --cli http://localhost:3000/sse --method tools/call --tool-name get_orders --tool-arg customerId=1
```
