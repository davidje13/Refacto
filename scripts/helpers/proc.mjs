import { spawn } from 'node:child_process';
import { access, constants } from 'node:fs/promises';

const activeChildren = new Set();
let shuttingDown = false;

async function closeAllChildren() {
  const snapshot = [...activeChildren.values()];
  activeChildren.clear();
  await Promise.allSettled(snapshot.map(interruptTask));
}

export async function exitWithCode(code, message) {
  shuttingDown = true;
  await closeAllChildren();
  if (message) {
    process.stderr.write(`\n${message}\n`);
  }
  // process.exit may lose stream data which has been buffered in NodeJS - wait for it all to be flushed before exiting
  await Promise.all([
    new Promise((resolve) => process.stdout.write('', resolve)),
    new Promise((resolve) => process.stderr.write('', resolve)),
  ]);
  process.exit(code);
}

process.on('SIGINT', () => exitWithCode(2, 'interrupted').catch(() => null));

const MAX_LINE_BUFFER = 10000;

export function propagateStreamWithPrefix(
  target,
  stream,
  prefix,
  prefixFormat = '',
) {
  const pre =
    target.isTTY && prefixFormat
      ? `\u001B[${prefixFormat}m${prefix}:\u001B[0m `
      : `${prefix}: `;
  const suf = target.isTTY ? '\u001B[0m\n' : '\n';
  const curLine = Buffer.alloc(MAX_LINE_BUFFER);
  let curLineP = 0;
  const printCurrentLine = (data) => {
    target.write(pre);
    if (curLineP > 0) {
      target.write(curLine.subarray(0, curLineP));
      curLineP = 0;
    }
    target.write(data);
    target.write(suf);
  };
  stream.on('data', (data) => {
    let begin = 0;
    while (true) {
      const p = data.indexOf(10, begin); // \n
      if (p === -1) {
        break;
      }
      printCurrentLine(data.subarray(begin, p));
      begin = p + 1;
    }
    const remaining = data.length - begin;
    if (curLineP + remaining > MAX_LINE_BUFFER) {
      printCurrentLine(data.subarray(begin));
    } else if (remaining > 0) {
      curLineP += data.copy(curLine, curLineP, begin);
    }
  });
  return new Promise((resolve) => {
    stream.on('close', () => {
      if (curLineP > 0) {
        printCurrentLine(Buffer.of());
      }
      resolve();
    });
  });
}

export function printPrefixed(target, message, prefix, prefixFormat = '') {
  const pre =
    target.isTTY && prefixFormat
      ? `\u001B[${prefixFormat}m${prefix}:\u001B[0m `
      : `${prefix}: `;
  const suf = target.isTTY ? '\u001B[0m\n' : '\n';
  const lines = message.split('\n');
  for (const line of lines) {
    target.write(pre);
    target.write(line);
    target.write(suf);
  }
}

export function waitForOutput(stream, search, timeout = 60 * 60 * 1000) {
  let all = [];
  const byteSearch = Buffer.from(search, 'utf-8');
  const promise = new Promise((resolve, reject) => {
    let found = !byteSearch.length;
    let tm;
    if (!found) {
      tm = setTimeout(() => {
        if (!found) {
          reject(new Error('timeout'));
        }
      }, timeout);
    }
    stream.on('data', (data) => {
      all.push(data);
      if (found) {
        return;
      }
      if (data.includes(byteSearch)) {
        found = true;
        clearTimeout(tm);
        resolve();
      }
      if (all.length < 2) {
        return;
      }
      const combined = Buffer.concat(all);
      all = [combined];
      // check the boundary between data frames
      const boundary = combined.length - data.length;
      const boundaryRegion = combined.subarray(
        Math.max(boundary - byteSearch.length, 0),
        boundary + byteSearch.length,
      );
      if (boundaryRegion.includes(byteSearch)) {
        found = true;
        clearTimeout(tm);
        resolve();
      }
    });
    stream.on('close', () => {
      if (!byteSearch.length) {
        resolve();
      }
      if (!found) {
        clearTimeout(tm);
        reject(new Error('closed'));
      }
    });
  });
  return { promise, getOutput: () => Buffer.concat(all).toString('utf-8') };
}

const handleExit =
  (resolve, reject, allowSuccess = true) =>
  (code, signal) => {
    if (code === 0 && allowSuccess) {
      resolve();
    } else if (code !== null) {
      reject(new Error(`returned exit code ${code}`));
    } else {
      reject(new Error(`got signal ${signal}`));
    }
  };

export async function runTask({
  awaitFile = undefined,
  command,
  args = [],
  stdinPipe = false,
  output = process.stderr,
  outputPrefix = '',
  prefixFormat = '',
  outputMode = 'live',
  beginMessage = '',
  allowExit = true,
  successMessage = '',
  failureMessage = `failure in ${outputPrefix || command}`,
  exitOnFailure = true,
  ...options
}) {
  let stdio = [stdinPipe ? 'pipe' : 'ignore', 'pipe', 'pipe'];
  if (outputMode === 'live' && !outputPrefix) {
    stdio = [stdio[0], 'inherit', 'inherit'];
  }
  if (awaitFile) {
    while (true) {
      try {
        await access(awaitFile, constants.R_OK);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }
  return new Promise((resolve, reject) => {
    if (shuttingDown) {
      return; // neither resolve nor reject - the app is shutting down and will exit soon anyway
    }
    if (beginMessage) {
      output.write(`${beginMessage}\n`);
    }
    let handled = false;
    const proc = spawn(command, args, { ...options, stdio });
    activeChildren.add(proc);
    let printInfo = () => undefined;
    let streamsClosed = Promise.resolve();
    if (outputMode === 'live') {
      if (outputPrefix) {
        streamsClosed = Promise.all([
          propagateStreamWithPrefix(
            output,
            proc.stdio[1],
            outputPrefix,
            prefixFormat,
          ),
          propagateStreamWithPrefix(
            output,
            proc.stdio[2],
            outputPrefix,
            prefixFormat,
          ),
        ]);
      }
    } else {
      const s1 = waitForOutput(proc.stdio[1], '');
      const s2 = waitForOutput(proc.stdio[2], '');
      streamsClosed = Promise.all([s1.promise, s2.promise]);
      printInfo = () => {
        output.write(`\nexit code: ${proc.exitCode}\n`);
        const v1 = s1.getOutput();
        if (v1) {
          output.write(`\nstdout:\n`);
          printPrefixed(output, v1, outputPrefix, prefixFormat);
        }
        const v2 = s2.getOutput();
        if (v2) {
          output.write(`\nstderr:\n`);
          printPrefixed(output, v2, outputPrefix, prefixFormat);
        }
      };
    }
    const wrappedResolve = async (v) => {
      if (stdinPipe) {
        proc.stdio[0].end();
      }
      activeChildren.delete(proc);
      if (shuttingDown || handled) {
        return;
      }
      handled = true;
      await streamsClosed;
      if (successMessage) {
        output.write(`${successMessage}\n`);
      }
      if (outputMode === 'atomic' || outputMode === 'success_atomic') {
        printInfo();
      }
      resolve(v);
    };
    const wrappedReject = async (e) => {
      if (stdinPipe) {
        proc.stdio[0].end();
      }
      activeChildren.delete(proc);
      if (shuttingDown || handled) {
        return;
      }
      handled = true;
      await streamsClosed;
      output.write(
        `${failureMessage} - ${e instanceof Error ? e.message : e}\n`,
      );
      if (outputMode === 'atomic' || outputMode === 'fail_atomic') {
        printInfo();
      }
      if (exitOnFailure) {
        exitWithCode(proc.exitCode || 1).catch(() => null);
      } else {
        reject(e);
      }
    };
    proc.on('error', (e) => {
      streamsClosed = Promise.resolve(); // process did not start, so do not wait for streams to close
      wrappedReject(e);
    });
    proc.on('exit', handleExit(wrappedResolve, wrappedReject, allowExit));
  });
}

export async function runTaskCaptureOutput({ command, args = [], ...options }) {
  if (shuttingDown) {
    throw new Error('shutting down');
  }
  const proc = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  let stdout = '';
  proc.stdout.on('data', (part) => {
    stdout += part.toString();
  });
  activeChildren.add(proc);
  await new Promise((resolve, reject) => {
    proc.on('error', (err) => {
      activeChildren.delete(proc);
      reject(err);
    });
    proc.on('close', (code) => {
      activeChildren.delete(proc);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
  return stdout;
}

export async function runMultipleTasks(tasks, { parallel = true } = {}) {
  if (parallel) {
    try {
      await Promise.all(tasks.map(runTask));
    } catch (e) {
      await closeAllChildren();
      throw e;
    }
  } else {
    for (const task of tasks) {
      await runTask(task);
    }
  }
}

export function runBackgroundTask({ command, args = [], ...options }) {
  if (shuttingDown) {
    throw new Error('shutting down');
  }
  const proc = spawn(command, args, options);
  activeChildren.add(proc);
  proc.on('error', () => activeChildren.delete(proc));
  proc.on('exit', () => activeChildren.delete(proc));
  return proc;
}

export function interruptTask(proc) {
  return new Promise((resolve, reject) => {
    if (proc.exitCode !== null || proc.signalCode !== null) {
      handleExit(resolve, reject)(proc.exitCode, proc.signalCode);
      return;
    }
    proc.on('exit', handleExit(resolve, reject));
    proc.kill(2);
  });
}
