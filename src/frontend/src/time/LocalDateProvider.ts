export default class LocalDateProvider {
  private readonly now: number;

  public constructor(timestampNow: number) {
    this.now = timestampNow;
  }

  public getMidnightTimestamp(dayOffset = 0): number {
    const date = new Date(this.now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);
    return date.getTime();
  }
}
