// Converted Flask auth server to Express (TypeScript)
// Note: install dependencies: npm i express && npm i -D @types/express @types/node

// @ts-ignore
import express from 'express';
// @ts-ignore
import * as crypto from 'crypto';

const app = express();
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

type AuthCode = {
  client_id?: string;
  redirect_uri?: string;
  code_challenge?: string | null;
};

const authCodes: Record<string, AuthCode> = {};
const accessTokens: Record<string, { user: string }> = {};

app.post('/introspect', (req, res) => {
  const token = (req.body && req.body.token) || req.query.token;
  const tokenData = token ? accessTokens[token as string] : undefined;

  if (!tokenData) {
    return res.json({ active: false });
  }

  return res.json({
    active: true,
    scope: 'read',
    username: tokenData.user,
    client_id: 'abc',
    token_type: 'access_token',
    exp: 9999999999,
    sub: 'user123',
  });
});

app.get('/authorize', (req, res) => {
  const client_id = req.query.client_id as string | undefined;
  const redirect_uri = req.query.redirect_uri as string | undefined;
  const state = req.query.state as string | undefined;
  const code_challenge = req.query.code_challenge as string | undefined;

  if (!redirect_uri) {
    return res.status(400).send('Missing redirect_uri');
  }

  // Simulate login/consent and create an authorization code
  const code = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  authCodes[code] = {
    client_id,
    redirect_uri,
    code_challenge,
  };

  const separator = redirect_uri.includes('?') ? '&' : '?';
  const location = `${redirect_uri}${separator}code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
  return res.redirect(location);
});

app.post('/token', (req, res) => {
  const code = req.body && req.body.code;
  const code_verifier = req.body && req.body.code_verifier;

  if (!code || !(code in authCodes)) {
    return res.status(400).json({ error: 'invalid_code' });
  }

  // Simplified PKCE check (mirrors original simplification)
  if (authCodes[code].code_challenge !== code_verifier) {
    return res.status(400).json({ error: 'invalid_code_verifier' });
  }

  // Consume the auth code
  delete authCodes[code];

  const access_token = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  accessTokens[access_token] = { user: 'chris' };

  return res.json({
    access_token,
    token_type: 'Bearer',
    expires_in: 3600,
  });
});

app.get('/logout', (_req, res) => {
  return res.status(200).send('Logged out (simulated)');
});

const _env = (globalThis as any).process?.env as Record<string, string> | undefined;
const PORT = _env && _env.PORT ? parseInt(_env.PORT, 10) : 5000;
app.listen(PORT, () => {
  console.log(`Auth server started and running on ${PORT}`);
});
