import type express from 'express';

const devMode = process.env['NODE_ENV'] === 'development';

const CSP_DOMAIN_PLACEHOLDER = /\(domain\)/g;
const CSP = [
  "base-uri 'self'",
  "default-src 'self'",
  "object-src 'none'",
  `script-src 'self'${devMode ? " 'unsafe-eval'" : ''}`,
  `style-src 'self'${
    devMode
      ? " 'unsafe-inline'"
      : " 'sha256-dhQFgDyZCSW+FVxPjFWZQkEnh+5DHADvj1I8rpzmaGU='"
  }`,
  'trusted-types dynamic-import',
  "require-trusted-types-for 'script'",
  // https://github.com/w3c/webappsec-csp/issues/7 (2024: still required for Mobile Safari 16.x)
  `connect-src 'self' wss://(domain)${devMode ? ' ws://(domain)' : ''}`,
  "img-src 'self' data: https://*.giphy.com",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=()',
  'camera=()',
  'geolocation=()',
  'gyroscope=()',
  'interest-cohort=()',
  'magnetometer=()',
  'microphone=()',
  'payment=()',
  'sync-xhr=()',
  'usb=()',
].join(', ');

export function addSecurityHeaders(
  req: express.Request,
  res: express.Response,
) {
  res.header('x-frame-options', 'DENY');
  res.header('x-xss-protection', '1; mode=block');
  res.header('x-content-type-options', 'nosniff');
  res.header(
    'content-security-policy',
    CSP.replace(CSP_DOMAIN_PLACEHOLDER, getHost(req)),
  );
  res.header('permissions-policy', PERMISSIONS_POLICY);
  res.header('referrer-policy', 'no-referrer');
  res.header('cross-origin-opener-policy', 'same-origin');
  // Note: CORP causes manifest icons to fail to load in Chrome Devtools,
  // but does not break actual functionality
  // See: https://issues.chromium.org/issues/41451129
  res.header('cross-origin-resource-policy', 'same-origin');
  res.header('cross-origin-embedder-policy', 'require-corp');
}

export function removeHtmlSecurityHeaders(res: express.Response) {
  res.removeHeader('content-security-policy');
  res.removeHeader('permissions-policy');
  res.removeHeader('referrer-policy');
  res.removeHeader('cross-origin-opener-policy');
  res.removeHeader('cross-origin-embedder-policy');
}

export function addNoCacheHeaders(res: express.Response) {
  res.header('cache-control', 'no-cache, no-store');
  res.header('expires', '0');
  res.header('pragma', 'no-cache');
}

function getHost(req: { hostname: string }): string {
  const raw: string = req.hostname;
  if (raw.includes(':')) {
    return raw;
  }
  // Bug in express 4.x: hostname does not include port
  // fixed in 5, but not released yet
  // https://expressjs.com/en/guide/migrating-5.html#req.host
  return `${raw}:*`;
}
