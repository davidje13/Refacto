import { Router } from 'websocket-express';

export default class ApiAuthRouter extends Router {
  constructor(retroAuthService) {
    super();

    const tokenLifespan = 60 * 60 * 24 * 30 * 6;

    this.post('/tokens/:retroId', async (req, res) => {
      const { retroId } = req.params;
      const { password } = req.body;

      const now = Math.floor(Date.now() / 1000);

      const scopes = {
        read: true,
        readArchives: true,
        write: true,
      };
      const retroToken = await retroAuthService.exchangePassword(
        retroId,
        password,
        {
          iat: now,
          exp: now + tokenLifespan,
          aud: `retro-${retroId}`,
          scopes,
        },
      );
      if (!retroToken) {
        res.status(400).json({ error: 'incorrect password' });
        return;
      }

      res.status(200).json({ retroToken });
    });
  }
}
