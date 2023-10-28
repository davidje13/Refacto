import { dirname, resolve, join } from 'node:path';
import { readFile, mkdir, rm } from 'node:fs/promises';

export const selfdir = dirname(new URL(import.meta.url).pathname);

export const downloadDir = resolve(
  join(selfdir, '..', '..', 'build', 'downloads'),
);
await rm(downloadDir, { recursive: true, force: true });
await mkdir(downloadDir, { recursive: true });

export async function waitForFile(
  name: string,
  timeout: number,
): Promise<string> {
  const fileName = join(downloadDir, name);
  const exp = Date.now() + timeout;

  do {
    try {
      return await readFile(fileName, { encoding: 'utf-8' });
    } catch (e) {
      await new Promise((res): void => {
        setTimeout(res, 100);
      });
    }
  } while (Date.now() < exp);

  throw new Error(`Failed to download file ${name} within ${timeout}ms`);
}
