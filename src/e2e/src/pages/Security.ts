import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';

export class Security extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/security', '.page-security');
  }

  public getHeaderText() {
    return this.getHeader().getText();
  }

  private getHeader() {
    return this.findElement(By.css('h1'));
  }
}
