import type { IncomingHttpHeaders } from 'node:http';
import { UserAgent } from '../helpers/UserAgent';
import type { Logger } from './LogService';

type DetailLevel = 'version' | 'brand' | 'message' | 'none';
type Request = { headers: IncomingHttpHeaders };

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

function canTrack(request: Request) {
  return request.headers['dnt'] !== '1' && request.headers['sec-gpc'] !== '1';
}

function getClient(request: Request, detail: DetailLevel) {
  if (detail === 'none' || detail === 'message' || !canTrack(request)) {
    return { platform: null, browser: null };
  }

  const agent = new UserAgent(request.headers['user-agent'] ?? '');
  return agent.getSummary(detail === 'version');
}
