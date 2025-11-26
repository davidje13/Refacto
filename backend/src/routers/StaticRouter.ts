import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateWeakETag, type ResolvedFileInfo } from 'web-listener';

const VERSIONED_FILE = /\.(.{4,})\.(css|js|woff2?)$/;
const VERSIONED_CACHE_CONTROL = [
  'public',
  `max-age=${365 * 24 * 60 * 60}`,
  `stale-if-error=${365 * 24 * 60 * 60}`,
  'immutable',
].join(', ');
const UNVERSIONED_CACHE_CONTROL = [
  'public',
  `max-age=${10 * 60}`,
  `stale-if-error=${24 * 60 * 60}`,
].join(', ');

export function setCacheHeaders(
  _: IncomingMessage,
  res: ServerResponse,
  file: ResolvedFileInfo,
) {
  const encoding = res.getHeader('content-encoding');
  res.setHeader('last-modified', file.stats.mtime.toUTCString());
  const match = VERSIONED_FILE.exec(file.canonicalPath);
  if (match) {
    res.setHeader('etag', `"${match[1]}-${encoding ?? ''}"`);
    res.setHeader('cache-control', VERSIONED_CACHE_CONTROL);
  } else {
    res.setHeader('etag', generateWeakETag(encoding, file.stats));
    res.setHeader('cache-control', UNVERSIONED_CACHE_CONTROL);
  }
}
