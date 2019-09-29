import { By, WebDriver, WebElementPromise } from 'selenium-webdriver';
import Page from './common/Page';

export default class Security extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/security', '.page-security');
  }

  public getHeaderText(): Promise<string> {
    return this.getHeader().getText();
  }

  private getHeader(): WebElementPromise {
    return this.findElement(By.css('h1'));
  }
}
