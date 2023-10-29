import { spawn, execFile } from 'node:child_process';

const MAX_LINE_BUFFER = 10000;

export function propagateStreamWithPrefix(stream, target, prefix) {
  const pre = target.isTTY ? `\u001B[35m${prefix}:\u001B[0m ` : `${prefix}: `;
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

const handleExit = (resolve, reject) => (code, signal) => {
  if (code === 0) {
    resolve();
  } else if (code !== null) {
    reject(new Error(`returned exit code ${code}`));
  } else {
    reject(new Error(`got signal ${signal}`));
  }
};

export function runTaskPrefixOutput({
  command,
  args,
  outputTarget = process.stderr,
  outputPrefix = command,
  ...options
} = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    propagateStreamWithPrefix(proc.stdio[1], outputTarget, outputPrefix);
    propagateStreamWithPrefix(proc.stdio[2], outputTarget, outputPrefix);
    proc.on('error', reject);
    proc.on('exit', handleExit(resolve, reject));
  });
}

export function runTaskPrintOnFailure({
  command,
  args = [],
  failTarget = process.stderr,
  failMessage = `${command} ${args.join(' ')} failed`,
  ...options
} = {}) {
  return new Promise((resolve, reject) => {
    const proc = execFile(command, args, options, (err, stdout, stderr) => {
      if (!err && proc.exitCode === 0) {
        resolve();
        return;
      }
      failTarget.write(`${failMessage}\n\nexit code: ${proc.exitCode}\n`);
      if (stdout) {
        failTarget.write('\nstdout:\n');
        failTarget.write(stdout);
        failTarget.write('\n');
      }
      if (stderr) {
        failTarget.write('\nstderr:\n');
        failTarget.write(stderr);
        failTarget.write('\n');
      }
      reject(err ?? new Error(`returned exit code ${code}`));
    });
  });
}

export function runTask(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    proc.on('error', reject);
    proc.on('exit', handleExit(resolve, reject));
  });
}
