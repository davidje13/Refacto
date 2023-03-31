import path from 'node:path';
import { readFile, mkdir } from 'node:fs/promises';
import basedir from '../basedir';

export const downloadDir = path.resolve(path.join(basedir, '..', 'build', 'downloads'));
await mkdir(downloadDir, { recursive: true });

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
