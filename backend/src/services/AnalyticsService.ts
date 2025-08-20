import { UserAgent } from '../helpers/UserAgent';

type DetailLevel = 'version' | 'brand' | 'message' | 'none';

export class AnalyticsService {
  constructor(
    private readonly eventDetail: DetailLevel,
    private readonly clientErrorDetail: DetailLevel,
  ) {}

  log(o: Record<string, unknown>) {
    process.stderr.write(JSON.stringify({ time: Date.now(), ...o }) + '\n');
  }

  event(
    request: Request,
    eventName: string,
    metadata?: Record<string, string | number>,
  ) {
    if (this.eventDetail === 'none' || !canTrack(request)) {
      return;
    }

    const details = getDetails(request, this.eventDetail);
    this.log({ ...details, event: eventName, metadata });
  }

  error(context: string, err: unknown) {
    this.log({ context, ...parseError(err) });
  }

  requestError(request: Request, context: string, err: unknown) {
    this.clientError(request, context, parseError(err));
  }

  clientError(
    request: Request,
    context: string,
    detail: Record<string, unknown>,
  ) {
    if (this.clientErrorDetail === 'none') {
      return;
    }
    const details = getDetails(request, this.clientErrorDetail);
    this.log({ ...details, context, detail });
  }
}

interface Request {
  header(name: string): string | string[] | undefined;
}

function parseError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  } else if (typeof err === 'symbol') {
    return { name: typeof err, message: err.description ?? 'unnamed symbol' };
  } else {
    return { name: typeof err, message: String(err) };
  }
}

function canTrack(request: Request) {
  return request.header('dnt') !== '1' && request.header('sec-gpc') !== '1';
}

function getDetails(request: Request, detail: DetailLevel) {
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
