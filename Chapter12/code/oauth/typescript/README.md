# Run this sample

## -0- Set up

```sh
npm install
npm run build
```

## -1- Start the auth server

```sh
npm run start:auth-server
```

## -2- Start the resource server

```sh
npm run start:resource-server
```

## -3- Start the client

```sh
npm run start:client
```

You should see an outcome similar to:

```text
Requesting authorization: http://localhost:5000/authorize?client_id=abc&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=xyz&code_challenge=123&code_challenge_method=plain
Received authorization code: c8668488-4c47-46f7-9b90-16e21e25eef0
Access token: 58f3ace9-8cb5-495e-b7d3-61e1102a90a9
User info response:
{ sub: 'user123', name: 'Chris', email: 'chris@example.com' }
```