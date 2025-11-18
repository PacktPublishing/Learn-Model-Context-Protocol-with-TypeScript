// Converted Flask resource server to Express (TypeScript)
// Note: install dependencies: npm i express axios && npm i -D @types/express @types/node

import express from 'express';
import axios from 'axios';
import process from "node:process"

const app = express();
app.use(express.json());

const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:5000';

app.get('/userinfo', async (req, res) => {
  const authHeader = req.header('authorization') || '';
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Introspect token at the auth server (expects form-encoded body)
    const params = new URLSearchParams();
    params.append('token', token);

    const introspectResp = await axios.post(`${AUTH_SERVER}/introspect`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = introspectResp.data || {};
    const isActive = tokenData.active === true;

    if (!isActive) {
      return res.status(403).json({ error: 'invalid_token' });
    }

    return res.json({
      sub: 'user123',
      name: 'Chris',
      email: 'chris@example.com',
    });
  } catch (err) {
    // Treat any introspection error as invalid token (or return server error for unexpected failures)
    if (axios.isAxiosError(err) && err?.response) {
      console.error('Introspection failed:', err.response.status, err.response.data);
      return res.status(403).json({ error: 'invalid_token' });
    }

    console.error('Unexpected error during introspection:', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
app.listen(PORT, () => {
  console.log(`Resource server started on ${PORT}`);
});
