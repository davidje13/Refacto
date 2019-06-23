import crypto from 'crypto';

export default class UniqueIdProvider {
  private shared = crypto.randomBytes(8).toString('hex');

  private unique = 0;

  public get(): string {
    const id = this.unique;
    this.unique += 1;
    return `${this.shared}-${id}`;
  }
}
