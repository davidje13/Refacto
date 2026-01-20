import {
  getBodyJson,
  getPathParameters,
  HTTPError,
  requireBearerAuth,
  Router,
  sendJSON,
} from 'web-listener';
import type { RetroAuth } from '../shared/api-entities';
import type { RetroAuthService } from '../services/RetroAuthService';
import type { UserAuthService } from '../services/UserAuthService';
import type { RetroService } from '../services/RetroService';
import type { AnalyticsService } from '../services/AnalyticsService';
import { json } from '../helpers/json';

export class ApiAuthRouter extends Router {
  public constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    analyticsService: AnalyticsService,
    permitOwnerToken: boolean,
  ) {
    super();

    const userAuth = requireBearerAuth({
      realm: 'user',
      extractAndValidateToken: (token) =>
        userAuthService.readAndVerifyToken(token),
    });

    this.post('/tokens/:retroId/user', userAuth, async (req, res) => {
      const userId = userAuth.getTokenData(req).sub;
      const { retroId } = getPathParameters(req);

      if (!permitOwnerToken) {
        throw new HTTPError(403, { body: 'must use password' });
      }

      if (
        !retroId ||
        !(await retroService.isRetroOwnedByUser(retroId, userId))
      ) {
        throw new HTTPError(403, { body: 'not retro owner' });
      }

      const grant = await retroAuthService.grantOwnerToken(retroId);
      if (!grant) {
        throw new HTTPError(500, { body: 'retro not found' });
      }

      analyticsService.event(req, 'access own retro');
      const response: RetroAuth = {
        retroToken: grant.token,
        expires: grant.expires,
      };
      return sendJSON(res, response);
    });

    this.post('/tokens/:retroId', async (req, res) => {
      const { retroId } = getPathParameters(req);
      const body = await getBodyJson(req, { maxContentBytes: 4 * 1024 });
      const { password } = json.extractObject(body, { password: json.string });

      const begin = Date.now();
      const grant = await retroAuthService.grantForPassword(retroId, password);
      if (!grant) {
        throw new HTTPError(400, { body: 'incorrect password' });
      }

      const time = Date.now() - begin;
      analyticsService.event(req, 'access retro', { passwordCheckTime: time });
      const response: RetroAuth = {
        retroToken: grant.token,
        expires: grant.expires,
      };
      sendJSON(res, response);
    });
  }
}
