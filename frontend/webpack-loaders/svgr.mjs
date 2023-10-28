import { normalize } from 'node:path';
import { callbackify } from 'node:util';
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';

// Adapted from https://github.com/gregberge/svgr/blob/main/packages/webpack/src/index.ts#L49
// (avoids heavy @webpack/env dependency)
// https://github.com/gregberge/svgr/issues/900

export default function svgrLoader(contents) {
  this.cacheable?.();
  const callback = this.async();
  const options = this.getOptions();

  const previousExport = (() => {
    if (contents.startsWith('export ')) return contents;
    const exportMatches = contents.match(/^module.exports\s*=\s*(.*)/);
    return exportMatches ? `export default ${exportMatches[1]}` : null;
  })();

  const state = {
    caller: {
      name: '@svgr/webpack',
      previousExport,
      defaultPlugins: [jsx],
    },
    filePath: normalize(this.resourcePath),
  };

  const tranformSvg = callbackify(transform);
  if (!previousExport) {
    tranformSvg(contents, options, state, callback);
  } else {
    this.fs.readFile(this.resourcePath, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      tranformSvg(String(result), options, state, callback);
    });
  }
}
