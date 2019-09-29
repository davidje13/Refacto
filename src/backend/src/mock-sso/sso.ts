import WebSocketExpress from 'websocket-express';
import uuidv4 from 'uuid/v4';
import TokenManager, { KeyPair } from '../tokens/TokenManager';

// This is used for local development and smoke testing; it simulates a
// Google sign in handshake.

const tokenManager = new TokenManager();

let keys: KeyPair = { publicKey: '', privateKey: '' };
tokenManager.generateKeys().then((k) => {
  keys = k;
});

const app = new WebSocketExpress();

app.use(WebSocketExpress.urlencoded({ extended: false }));

function htmlSafe(value?: string): string {
  // Thanks, https://stackoverflow.com/a/6234804/1180785
  if (!value) {
    return '';
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/auth', (req, res) => {
  res.header('Content-Type', 'text/html').send(`
    <html>
      <head>
        <title>Mock OAuth service</title>
        <style>
          body {
            background: #EEEEEE;
            font: 1em sans-serif;
            margin: 0;
            padding: 0;
          }
          form {
            width: 400px;
            max-width: calc(100% - 20px);
            box-sizing: border-box;
            margin: 50px auto;
            padding: 15px;
            background: #FFFFFF;
          }
          h1 {
            margin: 0 0 20px;
            text-align: center;
          }
          p {
            font-size: 0.8em;
            margin: 20px 0;
          }
          input[type=text] {
            width: 200px;
            font-size: 0.9em;
            padding: 4px;
            margin: 0 10px;
          }
          button {
            font-size: 0.9em;
            padding: 6px 12px;
            border: none;
            background: #008800;
            color: #FFFFFF;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <form method="POST">
          <h1>Mock OAuth service</h1>
          <p>
            This is a mock implementation of an OAuth server which is used
            for local testing (including end-to-end automated tests).
          </p>
          <input type="hidden" name="redirect_uri" value="${htmlSafe(req.query.redirect_uri)}" />
          <input type="hidden" name="nonce" value="${htmlSafe(req.query.nonce)}" />
          <input type="hidden" name="state" value="${htmlSafe(req.query.state)}" />
          <input type="hidden" name="client_id" value="${htmlSafe(req.query.client_id)}" />
          <label>Sign in as <input type="text" name="identifier" required autofocus /></label><button>Sign in</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/auth', (req, res) => {
  const {
    redirect_uri: redirectUri,
    nonce,
    state,
    client_id: clientId,
    identifier,
  } = req.body;

  if (!redirectUri || !clientId || !identifier) {
    res.status(400).json({ error: 'missing fields' });
  }

  const now = Math.floor(Date.now() / 1000);
  const data = {
    aud: clientId,
    nonce,
    jti: uuidv4(),
    sub: identifier,
    iat: now,
    exp: now + 60 * 60,
  };
  const idToken = tokenManager.signData(data, keys.privateKey);

  const redirectParams = new URLSearchParams();
  redirectParams.set('id_token', idToken);
  redirectParams.set('state', state);
  res.redirect(303, `${redirectUri}#${redirectParams.toString()}`);
});

app.get('/tokeninfo', (req, res) => {
  const { id_token: idToken } = req.query;
  try {
    const data = tokenManager.readAndVerifySigned(idToken, keys.publicKey);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: 'validation failure' });
  }
});

export default app;
