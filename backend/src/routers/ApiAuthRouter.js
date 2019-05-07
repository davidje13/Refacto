import { Router } from 'websocket-express';

export default class ApiAuthRouter extends Router {
  constructor(retroAuthService) {
    super();

    this.post('/tokens/:retroId', async (req, res) => {
      const { retroId } = req.params;
      const { password } = req.body;

      const permissions = {
        read: true,
        readArchives: true,
        write: true,
      };
      const retroToken = await retroAuthService.exchangePassword(
        retroId,
        password,
        permissions,
      );
      if (!retroToken) {
        res.status(400).json({ error: 'incorrect password' });
        return;
      }

      res.status(200).json({ retroToken });
    });
  }
}
