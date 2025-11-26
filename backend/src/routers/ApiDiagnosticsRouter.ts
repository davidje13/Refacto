import { getBodyJson, HTTPError, Router } from 'web-listener';
import type { ErrorReport } from '../shared/api-entities';
import type { AnalyticsService } from '../services/AnalyticsService';
import { json } from '../helpers/json';

export class ApiDiagnosticsRouter extends Router {
  public constructor(analyticsService: AnalyticsService) {
    super();

    this.post('/error', async (req, res) => {
      const body = await getBodyJson(req, { maxContentBytes: 16 * 1024 });
      for (const report of extractErrors(body)) {
        analyticsService.clientError(req, `Frontend error: ${report.message}`, {
          error: report.error,
        });
      }
      res.end();
    });

    this.post('/report', async (req, res) => {
      if (req.headers['content-type'] !== 'application/reports+json') {
        throw new HTTPError(415, { body: 'Invalid report' });
      }
      const body = await getBodyJson(req, { maxContentBytes: 64 * 1024 });
      const now = Date.now();
      for (const item of extractReports(body)) {
        const time = now - (item.age ?? 0);
        analyticsService.clientError(req, `Browser report: ${item.type}`, {
          time,
          body: item.body,
        });
      }
      res.end();
    });
  }
}

const OPTIONAL_PRIMITIVE = json.optional(json.nullable(json.primitive));

const extractErrors = json.array<ErrorReport>(
  json.object({
    message: json.string,
    error: json.array(
      json.object({
        name: json.string,
        message: json.string,
        stack: json.optional(json.string),
      }),
    ),
  }),
);

const extractReports = json.array(
  json.object({
    age: json.optional(json.number),
    type: json.string,
    body: json.nullable(
      json.object({
        effectiveDirective: OPTIONAL_PRIMITIVE,
        blockedURL: OPTIONAL_PRIMITIVE,
        statusCode: OPTIONAL_PRIMITIVE,

        effectivePolicy: OPTIONAL_PRIMITIVE,

        type: OPTIONAL_PRIMITIVE,
        previousResponseURL: OPTIONAL_PRIMITIVE,
        nextResponseURL: OPTIONAL_PRIMITIVE,
        openerURL: OPTIONAL_PRIMITIVE,
        openedWindowURL: OPTIONAL_PRIMITIVE,
        openedWindowInitialURL: OPTIONAL_PRIMITIVE,
        otherURL: OPTIONAL_PRIMITIVE,

        id: OPTIONAL_PRIMITIVE,

        reason: OPTIONAL_PRIMITIVE,
        stack: OPTIONAL_PRIMITIVE,

        sourceFile: OPTIONAL_PRIMITIVE,
        lineNumber: OPTIONAL_PRIMITIVE,
        columnNumber: OPTIONAL_PRIMITIVE,
      }),
    ),
  }),
);
