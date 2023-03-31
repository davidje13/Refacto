import {
  By,
  until,
  WebDriver,
  WebElementCondition,
} from 'selenium-webdriver';
import customUntil from '../../helpers/customUntil';
import PageFragment from './PageFragment';
import Popup from './Popup';

const HOST = process.env.TARGET_HOST ?? '';
if (!HOST) {
  throw new Error('Must configure TARGET_HOST');
}

const untilNoLoaders = customUntil.noElementLocated(By.css('.loader'));

async function getDocumentHtml(driver: WebDriver): Promise<string> {
  try {
    return await driver.executeScript('return document.body.outerHTML');
  } catch (e) {
    return 'Failed to get HTML of document';
  }
}

export default abstract class Page extends PageFragment {
  private readonly untilNavigated: WebElementCondition;

  protected constructor(
    driver: WebDriver,
    private readonly subpath: string,
    expectedCSS: string,
  ) {
    super(driver, By.css('body'));
    this.untilNavigated = until.elementLocated(By.css(expectedCSS));
  }

  public async load(): Promise<this> {
    await this.navigate();
    await this.wait();
    return this;
  }

  public async wait(): Promise<this> {
    try {
      await this.driver.wait(
        this.untilNavigated,
        this.explicitWaitTimeout,
        `Failed to load page '${this.constructor.name}'`,
      );
      await this.driver.wait(
        untilNoLoaders,
        this.explicitWaitTimeout,
        `Loading indicator for page '${this.constructor.name}' did not disappear`,
      );
    } catch (e) {
      if (e instanceof Error) {
        const content = await getDocumentHtml(this.driver);
        e.message = `${e.message}\n\nPage content:\n\n${content}`;
      }
      throw e;
    }
    // wait an additional frame to allow some async events (e.g. title changes)
    await this.driver.sleep(100);
    return this;
  }

  public getTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  protected async navigate(): Promise<void> {
    const path = new URL(this.subpath, HOST).toString();
    process.stdout.write(`Navigating to ${path}\n`);
    await this.driver.get(path);
  }

  protected getPopup(className: string): Popup {
    return new Popup(this.driver, className);
  }

  protected sendKeys(...keys: Array<string|Promise<string>>): Promise<void> {
    return this.driver.actions().sendKeys(...keys).perform();
  }
}
