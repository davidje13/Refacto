import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  fileServer,
  generateWeakETag,
  negotiateEncoding,
  Negotiator,
  Router,
  staticContent,
  type ResolvedFileInfo,
} from 'web-listener';
import type { ClientConfig } from '../shared/api-entities';

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
const UNVERSIONED_INDEX = [
  'public',
  'max-age=0',
  `stale-if-error=${365 * 24 * 60 * 60}`,
].join(', ');

export async function addStaticContent(
  app: Router,
  dir: string,
  clientConfig: ClientConfig,
) {
  const staticFiles = await fileServer(join(dir, 'resources'), {
    mode: 'static-paths',
    negotiator: new Negotiator([negotiateEncoding(['br', 'gzip'])]),
    hide: [/\.(br|gz)^/],
    callback: setCacheHeaders,
  });
  app.use(staticFiles);

  const indexContentRaw = await readFile(join(dir, 'index.html'), {
    encoding: 'utf-8',
  });
  const indexContentWithConfig = indexContentRaw.replace(
    '<head',
    `<head data-config="${escapeHTML(JSON.stringify(clientConfig))}"`,
  );
  app.get(
    '/*any',
    staticContent(
      Buffer.from(indexContentWithConfig, 'utf-8'),
      'text/html; charset=utf-8',
      {
        headers: {
          'cache-control': UNVERSIONED_INDEX,
          'last-modified': new Date().toUTCString(), // config may have changed, so mark file modified as of server start
        },
        encodings: ['br', 'gzip'],
        minCompression: 100,
      },
    ),
  );
}

const escapeHTML = (v: string) =>
  v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function setCacheHeaders(
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
