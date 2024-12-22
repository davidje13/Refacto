import { WebSocketExpress, Router, type JWTPayload } from 'websocket-express';
import { type RetroAuthService } from '../services/RetroAuthService';
import { type UserAuthService } from '../services/UserAuthService';
import { type RetroService } from '../services/RetroService';
import { safe } from '../helpers/routeHelpers';

const JSON_BODY = WebSocketExpress.json({ limit: 4 * 1024 });

export class ApiAuthRouter extends Router {
  public constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    permitOwnerToken: boolean,
  ) {
    super();

    const userAuthMiddleware = WebSocketExpress.requireBearerAuth(
      'user',
      (token): JWTPayload | null => userAuthService.readAndVerifyToken(token),
    );

    this.get(
      '/tokens/:retroId/user',
      userAuthMiddleware,
      safe<{ retroId: string }>(async (req, res) => {
        const userId = WebSocketExpress.getAuthData(res).sub!;
        const { retroId } = req.params;

        if (!permitOwnerToken) {
          res.status(403).json({ error: 'must use password' });
          return;
        }

        if (
          !retroId ||
          !(await retroService.isRetroOwnedByUser(retroId, userId))
        ) {
          res.status(403).json({ error: 'not retro owner' });
          return;
        }

        const retroToken = await retroAuthService.grantOwnerToken(retroId);
        if (!retroToken) {
          res.status(500).json({ error: 'retro not found' });
          return;
        }

        res.status(200).json({ retroToken });
      }),
    );

    this.post(
      '/tokens/:retroId',
      JSON_BODY,
      safe<{ retroId: string }>(async (req, res) => {
        const { retroId } = req.params;
        const { password } = req.body;

        const retroToken = await retroAuthService.grantForPassword(
          retroId,
          password,
        );
        if (!retroToken) {
          res.status(400).json({ error: 'incorrect password' });
          return;
        }

        res.status(200).json({ retroToken });
      }),
    );
  }
}
