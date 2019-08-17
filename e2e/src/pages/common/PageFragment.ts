import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';

export default abstract class PageFragment {
  protected constructor(
    protected readonly driver: WebDriver,
    protected readonly locator: By,
  ) {}

  public async exists(): Promise<boolean> {
    return (await this.driver.findElements(this.locator)).length > 0;
  }

  public async expectChange(fn: () => (void | Promise<void>)): Promise<void> {
    const container = await this.container();
    const oldState = await container.getText();
    await fn();
    await this.driver.wait(async () => {
      const state = await container.getText();
      return state !== oldState;
    });
  }

  protected container(): WebElementPromise {
    return this.driver.findElement(this.locator);
  }

  protected findElement(selector: By): WebElementPromise {
    return this.container().findElement(selector);
  }

  protected findElements(selector: By): Promise<WebElement[]> {
    return this.container().findElements(selector);
  }

  protected setFormValue(selector: By, value: string): Promise<void> {
    return this.findElement(selector).sendKeys(value);
  }

  protected click(selector: By): Promise<void> {
    return this.findElement(selector).click();
  }
}
