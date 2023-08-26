export function logInfo(message: string) {
  process.stderr.write(`${message}\n`);
}

export function logError(message: string, err: unknown) {
  if (err instanceof Error) {
    process.stderr.write(`${message}: ${err.message}\n`);
  } else {
    process.stderr.write(`${message}: ${err}\n`);
  }
}
