import { Router } from 'websocket-express';
import UserAuthService from '../services/UserAuthService';
import SsoService from '../services/SsoService';

export default class ApiSsoRouter extends Router {
  public constructor(
    userAuthService: UserAuthService,
    ssoService: SsoService,
  ) {
    super();

    const tokenLifespan = 60 * 60 * 2;

    this.post('/:name', async (req, res) => {
      const name = req.params.name as string;

      if (!ssoService.supportsService(name)) {
        res.status(404).end();
        return;
      }

      const { externalToken } = req.body;
      if (!externalToken) {
        res.status(400).json({ error: 'no externalToken provided' });
        return;
      }

      try {
        const externalId = await ssoService.extractId(name, externalToken);
        if (!externalId) {
          throw new Error('failed to get user ID');
        }

        const now = Math.floor(Date.now() / 1000);

        const userToken = userAuthService.grantToken({
          iat: now,
          exp: now + tokenLifespan,
          aud: 'user',
          provider: name,
          sub: `${name}-${externalId}`,
        });
        res.status(200).json({ userToken });
      } catch (e) {
        if (e.message === 'validation internal error') {
          res.status(500).json({ error: 'internal error' });
        } else {
          res.status(400).json({ error: e.message || 'unknown error' });
        }
      }
    });
  }
}
