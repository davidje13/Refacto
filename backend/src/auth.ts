import { buildAuthenticationBackend } from 'authentication-backend';
import {
  getBodyJson,
  getQuery,
  HTTPError,
  sendJSON,
  type Router,
} from 'web-listener';
import type { ClientConfig } from './shared/api-entities';
import type { ConfigT } from './config';
import type { UserAuthService } from './services/UserAuthService';
import { addNoCacheHeaders } from './headers';
import { json } from './helpers/json';

interface AuthBackend {
  addRoutes(app: Router): void;
  clientConfig: ClientConfig['sso'];
}

export function getAuthBackend(
  config: ConfigT,
  userAuthService: UserAuthService,
): AuthBackend {
  if (config.insecure.sharedAccount.enabled) {
    if (Object.values(config.sso).some((v) => v.clientId !== '')) {
      throw new Error('Cannot combine insecure login with SSO');
    }
    const path = config.insecure.sharedAccount.authUrl;
    if (!path.startsWith('/') || path.length < 2) {
      throw new Error(
        'Insecure login path must start with / and cannot be empty',
      );
    }
    return getInsecureAuthBackend(path, userAuthService);
  }

  const sso = buildAuthenticationBackend(
    config.sso,
    userAuthService.grantLoginToken,
  );
  return {
    addRoutes: (app) => app.mount('/api/sso', sso.router()),
    clientConfig: sso.service.clientConfig,
  };
}

function getInsecureAuthBackend(
  path: string,
  userAuthService: UserAuthService,
): AuthBackend {
  return {
    addRoutes: (app) => {
      app.post('/api/sso/public', async (req, res) => {
        const body = await getBodyJson(req, { maxContentBytes: 5 * 1024 });
        const { externalToken } = json.extractObject(body, {
          externalToken: json.string,
        });
        return sendJSON(res, { userToken: externalToken });
      });

      app.get(path, (req, res) => {
        addNoCacheHeaders(res);
        const redirectUri = getQuery(req, 'redirect_uri');
        const state = getQuery(req, 'state');

        if (!redirectUri || !state) {
          throw new HTTPError(400, { body: 'bad request' });
        }

        const userToken = userAuthService.grantLoginToken(
          'everybody',
          'public',
        );
        const target = new URL(redirectUri);
        target.hash = new URLSearchParams({
          state,
          token: userToken,
        }).toString();

        res.setHeader('location', target.toString());
        res.writeHead(303).end();
      });
    },
    clientConfig: { public: { authUrl: path, clientId: '' } },
  };
}
