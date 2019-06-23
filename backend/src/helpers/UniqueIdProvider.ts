import crypto from 'crypto';

export default class UniqueIdProvider {
  private shared: string;

  private unique: number;

  public constructor() {
    this.shared = crypto.randomBytes(8).toString('hex');
    this.unique = 0;
  }

  public get(): string {
    const id = this.unique;
    this.unique += 1;
    return `${this.shared}-${id}`;
  }
}
