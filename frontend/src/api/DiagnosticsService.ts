import type { ErrorReport } from '../shared/api-entities';

export class DiagnosticsService {
  private messagesSent = 0;

  constructor(
    private readonly apiBase: string,
    private readonly messageLimit: number,
  ) {}

  info(message: string) {
    console.info(message);
  }

  warn(message: string, err: unknown) {
    console.warn(message, err);
  }

  error(message: string, err: unknown) {
    if (this.messagesSent >= this.messageLimit) {
      console.error(message, err, '(unreported)');
      return;
    }
    ++this.messagesSent;

    try {
      fetch(`${this.apiBase}/diagnostics/error`, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([getReport(message, err)]),
      }).catch((e) => console.error('error while reporting previous error', e));
      console.error(message, err, '(reporting)');
    } catch (e) {
      console.error(message, err, '(failed to report)', e);
    }
  }
}

function getReport(message: string, err: unknown): ErrorReport {
  const report: ErrorReport = { message, error: [] };
  const seen = new Set<unknown>();
  while (err !== undefined && err !== null) {
    if (seen.has(err)) {
      report.error.push({ name: '[clipped]', message: 'recursive' });
      break;
    }
    if (seen.size > 3) {
      report.error.push({ name: '[clipped]', message: 'too many causes' });
      break;
    }
    seen.add(err);
    if (err instanceof Error) {
      report.error.push({
        name: err.name,
        message: err.message,
        stack: err.stack?.substring(0, 4096),
      });
      err = err.cause;
    } else if (typeof err === 'symbol') {
      report.error.push({
        name: typeof err,
        message: err.description ?? 'unnamed symbol',
      });
      break;
    } else {
      report.error.push({ name: typeof err, message: String(err) });
      break;
    }
  }
  return report;
}
