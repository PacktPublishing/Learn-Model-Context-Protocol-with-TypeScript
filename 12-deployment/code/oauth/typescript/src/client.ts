import axios from 'axios';
import process from 'node:process';

// Configuration - use globalThis.process to avoid depending on node type declarations in this example
const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:5000';
const RESOURCE_SERVER = process.env.RESOURCE_SERVER || 'http://localhost:5001';
const CLIENT_ID = process.env.CLIENT_ID || 'abc';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';
const STATE = 'xyz';
const CODE_CHALLENGE = '123';
const CODE_VERIFIER = '123';

// Helper to exit in Node.js if available
function exit(code = 0) {
  if (process && typeof process.exit === 'function') {
    process.exit(code);
  } else {
    // fallback for environments without process
    throw new Error(`Exit with code ${code}`);
  }
}

// TODO: add existing token use case (introspect existing token before starting auth flow)

async function run() {
  try {
    // Step 1: Simulate browser redirect to /authorize
    const authorizeUrl = `${AUTH_SERVER}/authorize?client_id=${encodeURIComponent(
      CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${encodeURIComponent(
      STATE
    )}&code_challenge=${encodeURIComponent(CODE_CHALLENGE)}&code_challenge_method=plain`;

    console.log(`Requesting authorization: ${authorizeUrl}`);

    const authResp = await axios.get(authorizeUrl, {
      // prevent following redirects so we can inspect Location header
      maxRedirects: 0,
      // accept non-2xx statuses without throwing
      validateStatus: () => true,
    });

    const redirectLocation = (authResp.headers && (authResp.headers['location'] || authResp.headers['Location'])) as
      | string
      | undefined;

    if (!redirectLocation) {
      console.error('Authorization server did not redirect. Is it running?');
      exit(1);
    }

    // Step 2: Extract authorization code from redirect
    const parsed = new URL(redirectLocation!);
    const authCode = parsed.searchParams.get('code');
    console.log(`Received authorization code: ${authCode}`);

    if (!authCode) {
      console.error('No authorization code found in redirect');
      exit(1);
    }

    // Step 3: Exchange code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', authCode!);
    tokenParams.append('redirect_uri', REDIRECT_URI);
    tokenParams.append('client_id', CLIENT_ID);
    tokenParams.append('code_verifier', CODE_VERIFIER);

    const tokenResp = await axios.post(`${AUTH_SERVER}/token`, tokenParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = tokenResp.data && tokenResp.data.access_token;
    console.log(`Access token: ${accessToken}`);

    if (!accessToken) {
      console.error('Token response did not include access_token', tokenResp.data);
      exit(1);
    }

    // Step 4: Call resource server
    const resourceResp = await axios.get(`${RESOURCE_SERVER}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('User info response:');
    console.log(resourceResp.data);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Unexpected error:', err);
    }
    exit(1);
  }
}

run();