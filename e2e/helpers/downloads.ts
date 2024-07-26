import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { readFile, mkdir, rm, stat } from 'node:fs/promises';

export const downloadDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'build',
  'downloads',
);
await rm(downloadDir, { recursive: true, force: true });
await mkdir(downloadDir, { recursive: true });

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function waitForFile(
  name: string,
  minimumSize: number,
  timeout: number,
): Promise<string> {
  const fileName = join(downloadDir, name);
  const exp = Date.now() + timeout;

  do {
    try {
      const { size } = await stat(fileName);
      if (size >= minimumSize) {
        // wait until file has some content
        await sleep(10); // wait a little longer to avoid partial file reads if we get unlucky with the timing
        return await readFile(fileName, { encoding: 'utf-8' });
      }
    } catch {}
    await sleep(100);
  } while (Date.now() < exp);

  throw new Error(`Failed to download file ${name} within ${timeout}ms`);
}
