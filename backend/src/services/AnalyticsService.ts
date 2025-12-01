import type { IncomingMessage } from 'node:http';
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
    request: IncomingMessage,
    eventName: string,
    metadata?: Record<string, string | number>,
  ) {
    if (this.eventDetail === 'none') {
      return;
    }
    const client = getClient(request, this.eventDetail);
    this.logger.log({ ...client, event: eventName, metadata });
  }

  requestError(request: IncomingMessage, context: string, err: unknown) {
    if (this.clientErrorDetail === 'none') {
      return;
    }
    const client = getClient(request, this.clientErrorDetail);
    this.logger.error(err, {
      ...client,
      context,
      path: maskURL(request.url ?? '/'),
    });
  }

  clientError(
    request: IncomingMessage,
    context: string,
    detail: Record<string, unknown>,
  ) {
    if (this.clientErrorDetail === 'none') {
      return;
    }
    const client = getClient(request, this.clientErrorDetail);
    this.logger.log({ ...client, context, detail });
  }
}

function canTrack(request: IncomingMessage) {
  return request.headers['dnt'] !== '1' && request.headers['sec-gpc'] !== '1';
}

function getClient(request: IncomingMessage, detail: DetailLevel) {
  if (detail === 'none' || detail === 'message') {
    return { platform: null, browser: null };
  }
  if (!canTrack(request)) {
    return { platform: 'opt out', browser: 'opt out' };
  }

  const ua = request.headers['user-agent'];
  if (!ua) {
    return { platform: 'not set', browser: 'not set' };
  }

  const agent = new UserAgent(ua);
  return agent.getSummary(detail === 'version');
}

function maskURL(url: string) {
  return url
    .replace(/\?.*$/, '?<masked>') // remove query string which may contain sensitive parameters
    .replaceAll(/[0-9a-f]{8}(\-[0-9a-f]{4}){3}\-[0-9a-f]{12}/g, '<masked>'); // remove anything which looks like a UUID
}
