import url from 'url';
import {
  By,
  until,
  WebDriver,
  WebElementCondition,
} from 'selenium-webdriver';
import customUntil from '../../helpers/customUntil';
import PageFragment from './PageFragment';
import Popup from './Popup';

const HOST = process.env.TARGET_HOST!;

const untilNoLoaders = customUntil.noElementLocated(By.css('.loader'));

export default abstract class Page extends PageFragment {
  private readonly untilNavigated: WebElementCondition;

  protected constructor(
    driver: WebDriver,
    private readonly subpath: string,
    expectedCSS: string,
  ) {
    super(driver, By.tagName('body'));
    this.untilNavigated = until.elementLocated(By.css(expectedCSS));
  }

  public async load(): Promise<this> {
    const path = url.resolve(HOST, this.subpath);
    process.stdout.write(`Navigating to ${path}\n`);
    await this.driver.get(path);
    await this.wait();
    return this;
  }

  public async wait(): Promise<this> {
    await this.driver.wait(this.untilNavigated, 5000);
    await this.driver.wait(untilNoLoaders, 5000);
    // wait an additional frame to allow some async events (e.g. title changes)
    await this.driver.sleep(100);
    return this;
  }

  public getTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  protected getPopup(className: string): Popup {
    return new Popup(this.driver, className);
  }
}
