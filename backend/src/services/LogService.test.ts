import {
  access,
  constants,
  mkdtemp,
  readFile,
  rename,
  rm,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LogService } from './LogService';

describe('LogService', () => {
  const DIR = beforeEach<string>(async ({ setParameter }) => {
    const dir = await mkdtemp(join(tmpdir(), 'logservice-'));
    setParameter(dir);
    return () => rm(dir, { recursive: true });
  });

  it('logs to a file', async ({ getTyped }) => {
    const dir = getTyped(DIR);
    const logFile = join(dir, 'primary.log');
    const service = new LogService(logFile);
    service.log({ message: 'A' });
    await service.close();

    const content = await readFile(logFile, {
      encoding: 'utf-8',
    });
    expect(content).toContain('"message":"A"');
  });

  it('creates the directory structure if necessary', async ({ getTyped }) => {
    const dir = getTyped(DIR);
    const logFile = join(dir, 'foo', 'bar', 'log');
    const service = new LogService(logFile);
    service.log({ message: 'A' });
    await service.close();

    const content = await readFile(logFile, {
      encoding: 'utf-8',
    });
    expect(content).toContain('"message":"A"');
  });

  it('continues logging if the file is renamed', async ({ getTyped }) => {
    const dir = getTyped(DIR);
    const logFile = join(dir, 'primary.log');
    const logFile2 = join(dir, 'secondary.log');
    const service = new LogService(logFile);
    service.log({ message: 'A' });
    service.log({ message: 'B' });

    await waitForFile(logFile);
    await rename(logFile, logFile2);

    service.log({ message: 'C' });
    await service.close();

    const content = await readFile(logFile2, {
      encoding: 'utf-8',
    });
    expect(content).toContain('"message":"A"');
    expect(content).toContain('"message":"B"');
    expect(content).toContain('"message":"C"');

    await expect(access(logFile, constants.R_OK)).toThrow('ENOENT');
  });

  it('begins a new file when reopened', async ({ getTyped }) => {
    const dir = getTyped(DIR);
    const logFile = join(dir, 'primary.log');
    const logFile2 = join(dir, 'secondary.log');
    const service = new LogService(logFile);
    service.log({ message: 'A' });

    await waitForFile(logFile);
    await rename(logFile, logFile2);

    service.log({ message: 'before reopen' });
    const reopenPromise = service.reopen();
    service.log({ message: 'during reopen' }); // lines logged during the reopen are queued for the new file
    await reopenPromise;
    service.log({ message: 'after reopen' });
    await service.close();

    const secondary = await readFile(logFile2, {
      encoding: 'utf-8',
    });
    expect(secondary).toContain('"message":"A"');
    expect(secondary).toContain('"message":"before reopen"');
    expect(secondary).not(toContain('"message":"during reopen"'));
    expect(secondary).not(toContain('"message":"after reopen"'));

    const primary = await readFile(logFile, {
      encoding: 'utf-8',
    });
    expect(primary).not(toContain('"message":"A"'));
    expect(primary).not(toContain('"message":"before reopen"'));
    expect(primary).toContain('"message":"during reopen"');
    expect(primary).toContain('"message":"after reopen"');
  });
});

async function waitForFile(path: string) {
  const deadline = Date.now() + 1000;
  while (true) {
    try {
      await access(path, constants.R_OK);
      return;
    } catch (e) {
      if (Date.now() > deadline) {
        throw e;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
