import { By, WebDriver, WebElementPromise } from 'selenium-webdriver';
import Page from './Page';

export default class Security extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/security', '.page-security');
  }

  public getHeader(): WebElementPromise {
    return this.driver.findElement(By.css('h1'));
  }

  public getHeaderText(): Promise<string> {
    return this.getHeader().getText();
  }
}
