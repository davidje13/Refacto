const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (timestamp: number) =>
  DATE_FORMATTER.format(new Date(timestamp));

export const formatTime = (timestamp: number) =>
  TIME_FORMATTER.format(new Date(timestamp));

export const formatDateTime = (timestamp: number) =>
  DATETIME_FORMATTER.format(new Date(timestamp));
