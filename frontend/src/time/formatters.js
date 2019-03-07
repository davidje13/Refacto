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

function wrap(timestamp) {
  if (typeof timestamp === 'object') {
    return timestamp;
  }
  return new Date(timestamp);
}

export function formatDate(timestamp) {
  return DATE_FORMATTER.format(wrap(timestamp));
}

export function formatTime(timestamp) {
  return TIME_FORMATTER.format(wrap(timestamp));
}

export function formatDateTime(timestamp) {
  return DATETIME_FORMATTER.format(wrap(timestamp));
}
