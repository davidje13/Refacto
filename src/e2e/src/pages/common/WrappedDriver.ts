import type { WebDriver } from 'selenium-webdriver';
import { getDownloadedBytes } from '../../helpers/downloadProfiler';

export default class WrappedDriver {
  public readonly driver: WebDriver;

  public constructor(driver: WebDriver) {
    this.driver = driver;
  }

  public getCurrentUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  public quit(): Promise<void> {
    return this.driver.quit();
  }

  public async getDownloadTime(
    operation: () => Promise<void>,
    bytesPerSecond: number,
  ): Promise<number> {
    const bytes = await getDownloadedBytes(this.driver, operation);
    return bytes / bytesPerSecond;
  }
}
