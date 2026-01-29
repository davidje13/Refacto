import {
  getBodyJSON,
  getPathParameters,
  hasAuthScope,
  HTTPError,
  requireAuthScope,
  Router,
  sendJSON,
  sendJSONStream,
  type WithPathParameters,
} from 'web-listener';
import type { RetroAuthService } from '../services/RetroAuthService';
import type { AnalyticsService } from '../services/AnalyticsService';
import { json } from '../helpers/json';

export class ApiRetroApiKeysRouter extends Router<
  WithPathParameters<{ retroId: string }>
> {
  constructor(
    retroAuthService: RetroAuthService,
    analyticsService: AnalyticsService,
  ) {
    super();

    this.post('/', requireAuthScope('manage'), async (req, res) => {
      const { retroId } = getPathParameters(req);
      const body = await getBodyJSON(req, { maxContentBytes: 4 * 1024 });
      const { name, scopes } = json.extractObject(body, {
        name: json.string,
        scopes: json.array(json.string),
      });
      for (const scope of scopes) {
        if (!hasAuthScope(req, scope)) {
          throw new HTTPError(403, {
            body: `cannot grant scope ${JSON.stringify(scope)}`,
          });
        }
      }

      const apiKey = await retroAuthService.createApiKey(retroId, name, scopes);
      if (!apiKey) {
        throw new HTTPError(400, { body: 'too many API keys' });
      }
      analyticsService.event(req, 'create retro key', {
        scopes: scopes.join(','),
      });
      return sendJSON(res, apiKey);
    });

    this.get('/', requireAuthScope('manage'), async (req, res) => {
      const { retroId } = getPathParameters(req);
      const apiKeys = retroAuthService.getApiKeysForRetro(retroId);
      try {
        await sendJSONStream(res, { apiKeys });
      } finally {
        apiKeys.return();
      }
    });

    this.delete('/:apiKeyId', requireAuthScope('manage'), async (req, res) => {
      const { retroId, apiKeyId } = getPathParameters(req);
      const deleted = await retroAuthService.deleteApiKey(retroId, apiKeyId);
      if (!deleted) {
        throw new HTTPError(404, { body: 'unknown API key' });
      }
      return sendJSON(res, {});
    });
  }
}
