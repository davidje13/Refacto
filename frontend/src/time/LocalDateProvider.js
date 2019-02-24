export default class LocalDateProvider {
  constructor(timestampNow) {
    this.now = timestampNow;
  }

  getMidnightTimestamp(dayOffset = 0) {
    const date = new Date(this.now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);
    return date.getTime();
  }
}
