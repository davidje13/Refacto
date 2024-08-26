import { type By, type WebDriver } from 'selenium-webdriver';

export abstract class PageFragment {
  protected readonly explicitWaitTimeout = Number(
    process.env['EXPLICIT_WAIT_TIMEOUT'] || '5000',
  );

  protected constructor(
    protected readonly driver: WebDriver,
    protected readonly locator: By,
  ) {}

  public async exists() {
    return (await this.driver.findElements(this.locator)).length > 0;
  }

  public async expectChange(fn: () => void | Promise<void>): Promise<void> {
    const container = await this.container();
    const oldState = await container.getText();
    await fn();
    await this.driver.wait(
      async () => {
        const state = await container.getText();
        return state !== oldState;
      },
      this.explicitWaitTimeout,
      `Expected content to change but did not:\n\n${oldState}`,
    );
  }

  protected container() {
    return this.driver.findElement(this.locator);
  }

  protected findElement(selector: By) {
    return this.container().findElement(selector);
  }

  protected findElements(selector: By) {
    return this.container().findElements(selector);
  }

  protected async setFormValue(selector: By, value: string) {
    const element = this.findElement(selector);
    await element.clear();
    await element.sendKeys(value);
  }

  protected click(selector: By) {
    return this.findElement(selector).click();
  }
}
