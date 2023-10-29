import { spawn } from 'node:child_process';

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
  stream.on('data', (data) => {
    let begin = 0;
    while (true) {
      const p = data.indexOf(10, begin); // \n
      if (p === -1) {
        break;
      }
      target.write(pre);
      if (curLineP > 0) {
        target.write(curLine.subarray(0, curLineP));
        curLineP = 0;
      }
      target.write(data.subarray(begin, p));
      target.write(suf);
      begin = p + 1;
    }
    if (curLineP + data.length - begin > MAX_LINE_BUFFER) {
      target.write(pre);
      if (curLineP > 0) {
        target.write(curLine.subarray(0, curLineP));
        curLineP = 0;
      }
      target.write(data.subarray(begin));
      target.write(suf);
    } else {
      data.copy(curLine, 0, begin);
      curLineP = data.length - begin;
    }
  });
  stream.on('close', () => {
    if (curLineP > 0) {
      target.write(pre);
      target.write(curLine.subarray(0, curLineP));
      target.write(suf);
    }
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

export function waitForOutput(stream, output, timeout = 60 * 60 * 1000) {
  let all = [];
  const promise = new Promise((resolve, reject) => {
    let found = !output;
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
      if (data.toString('utf-8').includes(output)) {
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
      const boundary = all.length - data.length;
      const boundaryRegion = all.subarray(
        Math.max(boundary - output.length * 4, 0),
        boundary + output.length * 4,
      );
      if (boundaryRegion.toString('utf-8').includes(output)) {
        found = true;
        clearTimeout(tm);
        resolve();
      }
    });
    stream.on('close', () => {
      if (!found) {
        clearTimeout(tm);
        reject(new Error('closed'));
      }
    });
  });
  return { promise, getOutput: () => Buffer.concat(all).toString('utf-8') };
}

const handleExit = (resolve, reject) => (code, signal) => {
  if (code === 0) {
    resolve();
  } else if (code !== null) {
    reject(new Error(`returned exit code ${code}`));
  } else {
    reject(new Error(`got signal ${signal}`));
  }
};

export function runTask({
  command,
  args = [],
  output = process.stderr,
  outputPrefix = '',
  prefixFormat = '',
  outputMode = 'live',
  beginMessage = '',
  successMessage = '',
  failureMessage = '',
  exitOnFailure = true,
  ...options
}) {
  let stdio = ['ignore', 'pipe', 'pipe'];
  if (outputMode === 'live' && !outputPrefix) {
    stdio = ['ignore', 'inherit', 'inherit'];
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
    if (outputMode === 'live') {
      if (outputPrefix) {
        propagateStreamWithPrefix(
          output,
          proc.stdio[1],
          outputPrefix,
          prefixFormat,
        );
        propagateStreamWithPrefix(
          output,
          proc.stdio[2],
          outputPrefix,
          prefixFormat,
        );
      }
    } else {
      const s1 = waitForOutput(proc.stdio[1], '');
      const s2 = waitForOutput(proc.stdio[2], '');
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
    const wrappedResolve = (v) => {
      activeChildren.delete(proc);
      if (shuttingDown || handled) {
        return;
      }
      handled = true;
      if (successMessage) {
        output.write(`${successMessage}\n`);
      }
      if (outputMode === 'atomic' || outputMode === 'success_atomic') {
        printInfo();
      }
      resolve(v);
    };
    const wrappedReject = (e) => {
      activeChildren.delete(proc);
      if (shuttingDown || handled) {
        return;
      }
      handled = true;
      if (failureMessage) {
        output.write(`${failureMessage}\n`);
      }
      if (outputMode === 'atomic' || outputMode === 'fail_atomic') {
        printInfo();
      }
      if (exitOnFailure) {
        exitWithCode(proc.exitCode || 1).catch(() => null);
      } else {
        reject(e);
      }
    };
    proc.on('error', wrappedReject);
    proc.on('exit', handleExit(wrappedResolve, wrappedReject));
  });
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
