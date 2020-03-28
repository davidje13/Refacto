import type { WebDriver } from 'selenium-webdriver';

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
}
