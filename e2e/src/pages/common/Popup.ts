import { By, WebDriver } from 'selenium-webdriver';
import customUntil from '../../helpers/customUntil';
import CBy from '../../helpers/customBy';
import PageFragment from './PageFragment';

export default class Popup extends PageFragment {
  public constructor(driver: WebDriver, className: string) {
    super(driver, By.css(`.popup-content .${className}`));
  }

  public async clickButton(label: string): Promise<void> {
    await this.click(CBy.buttonText(label));
  }

  public async waitUntilDismissed(): Promise<void> {
    await this.driver.wait(customUntil.noElementLocated(this.locator));
  }

  public async dismiss(): Promise<void> {
    if (!await this.exists()) {
      return;
    }

    this.driver.findElement(By.css('.popup-overlay')).click();
    await this.waitUntilDismissed();
  }
}
