import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GetClient } from 'web-listener';

const devMode = process.env['NODE_ENV'] === 'development';

const CSP = [
  "base-uri 'self'",
  "default-src 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'sha256-dhQFgDyZCSW+FVxPjFWZQkEnh+5DHADvj1I8rpzmaGU='",
  'trusted-types dynamic-import',
  "require-trusted-types-for 'script'",
  // https://github.com/w3c/webappsec-csp/issues/7 (2025: still required for Mobile Safari 16.x)
  `connect-src 'self' wss://(domain)${devMode ? ' ws://(domain)' : ''}`,
  "img-src 'self' data: https://*.giphy.com",
  "form-action 'none'",
  "frame-ancestors 'none'",
  'report-to default',
].join('; ');

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'attribution-reporting=()',
  'autoplay=()',
  'bluetooth=()',
  'browsing-topics=()',
  'camera=()',
  'compute-pressure=()',
  'cross-origin-isolated=()',
  'display-capture=()',
  'encrypted-media=()',
  'geolocation=()',
  'gyroscope=()',
  'idle-detection=()',
  'local-fonts=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'screen-wake-lock=()',
  'serial=()',
  'storage-access=()',
  'usb=()',
].join(', ');

export function addSecurityHeaders(
  req: IncomingMessage,
  res: ServerResponse,
  getClient: GetClient,
) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('reporting-endpoints', 'default="/api/diagnostics/report"');
  res.setHeader(
    'content-security-policy',
    CSP.replaceAll('(domain)', getClient(req).edge.host ?? ''),
  );
  res.setHeader('permissions-policy', PERMISSIONS_POLICY);
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('cross-origin-opener-policy', 'same-origin');
  res.setHeader('cross-origin-resource-policy', 'same-origin');
  res.setHeader('cross-origin-embedder-policy', 'require-corp');
}

export function removeHtmlSecurityHeaders(res: ServerResponse) {
  res.removeHeader('reporting-endpoints');
  res.removeHeader('content-security-policy');
  res.removeHeader('permissions-policy');
  res.removeHeader('referrer-policy');
  res.removeHeader('cross-origin-opener-policy');
  res.removeHeader('cross-origin-embedder-policy');
}

export function addNoCacheHeaders(res: ServerResponse) {
  res.setHeader('cache-control', 'no-cache, no-store');
  res.setHeader('expires', '0');
  res.setHeader('pragma', 'no-cache');
}
