import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import basedir from '../basedir';

const readFile = promisify(fs.readFile);

export const downloadDir = path.resolve(path.join(basedir, '..', 'build', 'downloads'));

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

export async function waitForFile(
  name: string,
  timeout: number,
): Promise<string> {
  const fileName = path.join(downloadDir, name);
  const exp = Date.now() + timeout;

  do {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await readFile(fileName, { encoding: 'utf-8' });
    } catch (e) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res): void => {
        setTimeout(res, 100);
      });
    }
  } while (Date.now() < exp);

  throw new Error(`Failed to download file ${name} within ${timeout}ms`);
}
