import {
  By,
  until,
  type WebDriver,
  type WebElementCondition,
} from 'selenium-webdriver';
import { untilNoElementLocated } from '../../helpers/customUntil';
import { PageFragment } from './PageFragment';
import { Popup } from './Popup';

const HOST = process.env['TARGET_HOST'] ?? '';
if (!HOST) {
  throw new Error('Must configure TARGET_HOST');
}

const untilNoLoaders = untilNoElementLocated(By.css('.loader'));

export abstract class Page extends PageFragment {
  private readonly untilNavigated: WebElementCondition;

  protected constructor(
    driver: WebDriver,
    private readonly subpath: string,
    expectedCSS: string,
  ) {
    super(driver, By.css('body'));
    this.untilNavigated = until.elementLocated(By.css(expectedCSS));
  }

  public async load(loadTimeoutOverride?: number) {
    await this.navigate();
    await this.wait(loadTimeoutOverride);
    return this;
  }

  public async wait(loadTimeoutOverride: number = 0) {
    await this.driver.wait(
      this.untilNavigated,
      Math.max(this.explicitWaitTimeout, loadTimeoutOverride),
      `Failed to load page '${this.constructor.name}'`,
    );
    await this.driver.wait(
      untilNoLoaders,
      this.explicitWaitTimeout,
      `Loading indicator for page '${this.constructor.name}' did not disappear`,
    );
    // wait an additional frame to allow some async events (e.g. title changes)
    await this.driver.sleep(100);
    return this;
  }

  public getTitle() {
    return this.driver.getTitle();
  }

  protected async navigate() {
    const path = new URL(this.subpath, HOST).toString();
    process.stdout.write(`Navigating to ${path}\n`);
    await this.driver.get(path);
  }

  protected getPopup(className: string) {
    return new Popup(this.driver, className);
  }

  protected async sendKeys(...keys: Array<string | Promise<string>>) {
    await this.driver
      .actions({ async: false, bridge: false })
      .sendKeys(...keys)
      .perform();
  }
}
