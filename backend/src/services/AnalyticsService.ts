import { UserAgent } from '../helpers/UserAgent';
import type { Logger } from './LogService';

type DetailLevel = 'version' | 'brand' | 'message' | 'none';

export class AnalyticsService {
  constructor(
    private readonly logger: Logger,
    private readonly eventDetail: DetailLevel,
    private readonly clientErrorDetail: DetailLevel,
  ) {}

  event(
    request: Request,
    eventName: string,
    metadata?: Record<string, string | number>,
  ) {
    if (this.eventDetail === 'none' || !canTrack(request)) {
      return;
    }

    const client = getClient(request, this.eventDetail);
    this.logger.log({ ...client, event: eventName, metadata });
  }

  requestError(request: Request, errorType: string, err: unknown) {
    if (this.clientErrorDetail === 'none') {
      return;
    }
    const client = getClient(request, this.clientErrorDetail);
    this.logger.error(errorType, err, client);
  }

  clientError(
    request: Request,
    errorType: string,
    detail: Record<string, unknown>,
  ) {
    if (this.clientErrorDetail === 'none') {
      return;
    }
    const client = getClient(request, this.clientErrorDetail);
    this.logger.log({ ...client, error: errorType, detail });
  }
}

interface Request {
  header(name: string): string | string[] | undefined;
}

function canTrack(request: Request) {
  return request.header('dnt') !== '1' && request.header('sec-gpc') !== '1';
}

function getClient(request: Request, detail: DetailLevel) {
  if (detail === 'none' || detail === 'message' || !canTrack(request)) {
    return { platform: null, browser: null };
  }

  let ua = request.header('user-agent');
  if (Array.isArray(ua)) {
    ua = ua[0];
  }
  const agent = new UserAgent(ua ?? '');
  return agent.getSummary(detail === 'version');
}
