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

export const formatDurationShort = (duration: number) => {
  if (duration < 0) {
    return '-';
  }
  const hours = Math.floor(duration / 1000 / 60 / 60);
  const minutes = Math.floor(duration / 1000 / 60) % 60;
  const seconds = Math.floor(duration / 1000) % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
};
