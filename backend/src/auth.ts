import { WebSocketExpress, type Router } from 'websocket-express';
import { buildAuthenticationBackend } from 'authentication-backend';
import type { ClientConfig } from './shared/api-entities';
import type { ConfigT } from './config';
import type { UserAuthService } from './services/UserAuthService';
import { addNoCacheHeaders } from './headers';
import { json } from './helpers/json';

const JSON_BODY = WebSocketExpress.json({ limit: 5 * 1024 });

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
    addRoutes: (app) => app.useHTTP('/api/sso', sso.router),
    clientConfig: sso.service.clientConfig,
  };
}

function getInsecureAuthBackend(
  path: string,
  userAuthService: UserAuthService,
): AuthBackend {
  return {
    addRoutes: (app) => {
      app.useHTTP('/api/sso/public', JSON_BODY, (req, res) => {
        try {
          const { externalToken } = json.extractObject(req.body, {
            externalToken: json.string,
          });
          res.status(200).json({ userToken: externalToken });
        } catch (e) {
          if (!(e instanceof Error)) {
            res.status(500).json({ error: 'Internal error' });
          } else {
            res.status(400).json({ error: e.message });
          }
        }
      });

      app.useHTTP(path, (req, res) => {
        addNoCacheHeaders(res);

        const { redirect_uri: redirectUri, state } = req.query;

        if (
          typeof redirectUri !== 'string' ||
          !redirectUri ||
          typeof state !== 'string' ||
          !state
        ) {
          res.status(400).json({ error: 'Bad request' });
          return;
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

        res.header('Location', target.toString());
        res.status(303).end();
      });
    },
    clientConfig: { public: { authUrl: path, clientId: '' } },
  };
}
