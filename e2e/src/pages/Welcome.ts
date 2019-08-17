import { By, WebDriver, WebElementPromise } from 'selenium-webdriver';
import Page from './Page';
import RetroCreate from './RetroCreate';
import Login from './Login';
import Security from './Security';

export default class Welcome extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-welcome');
  }

  public getHeader(): WebElementPromise {
    return this.driver.findElement(By.css('h1'));
  }

  public getHeaderText(): Promise<string> {
    return this.getHeader().getText();
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.css('.link-create'));

    return new RetroCreate(this.driver).wait();
  }

  public async clickLoginWithGoogle(): Promise<Login<RetroCreate>> {
    await this.click(By.css('.sso-google'));

    return new Login<RetroCreate>(this.driver, RetroCreate).wait();
  }

  public async clickSecurity(): Promise<Security> {
    const element = this.driver.findElement(By.css('.link-security'));
    // avoid opening a new tab, as this is difficult to manage
    await this.driver.executeScript(
      'arguments[0].setAttribute("target", "_self");',
      element,
    );
    await element.click();

    return new Security(this.driver).wait();
  }
}
