import { By, Key, type WebDriver } from 'selenium-webdriver';
import { untilNoElementLocated } from '../../helpers/customUntil';
import { byButtonText } from '../../helpers/customBy';
import { PageFragment } from './PageFragment';

export class Popup extends PageFragment {
  public constructor(driver: WebDriver, className: string) {
    super(driver, By.css(`.popup-content .${className}`));
  }

  public async clickButton(label: string) {
    await this.click(byButtonText(label));
  }

  public async waitUntilDismissed() {
    await this.driver.wait(
      untilNoElementLocated(this.locator),
      this.explicitWaitTimeout,
      'Popup did not close',
    );
  }

  public async dismiss() {
    if (!(await this.exists())) {
      return;
    }

    await this.driver
      .actions({ async: false, bridge: false })
      .sendKeys(Key.ESCAPE)
      .perform();
    await this.waitUntilDismissed();
  }
}
