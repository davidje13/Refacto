export const isoDate = (timestamp: number) =>
  new Date(timestamp).toISOString().split('T', 1)[0]!;
