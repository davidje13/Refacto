export class LocalDateProvider {
  declare private readonly now: number;

  constructor(timestampNow: number) {
    this.now = timestampNow;
  }

  getMidnightTimestamp(dayOffset = 0): number {
    const date = new Date(this.now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);
    return date.getTime();
  }
}
