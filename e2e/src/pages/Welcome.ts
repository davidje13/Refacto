import { By, WebDriver, WebElementPromise } from 'selenium-webdriver';
import Page from './common/Page';
import RetroCreate from './RetroCreate';
import SsoLogin from './SsoLogin';
import Security from './Security';
import RetroList from './RetroList';

export default class Welcome extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-welcome');
  }

  public getHeaderText(): Promise<string> {
    return this.getHeader().getText();
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.css('.link-create'));

    return new RetroCreate(this.driver).wait();
  }

  public async clickListRetros(): Promise<RetroList> {
    await this.click(By.linkText('My Retros'));

    return new RetroList(this.driver).wait();
  }

  public async clickLoginWithGoogle(): Promise<SsoLogin<RetroCreate>> {
    await this.click(By.css('.sso-google'));

    return new SsoLogin<RetroCreate>(this.driver, RetroCreate).wait();
  }

  public async clickSecurity(): Promise<Security> {
    const element = this.findElement(By.css('.link-security'));
    // avoid opening a new tab, as this is difficult to manage
    await this.driver.executeScript(
      'arguments[0].setAttribute("target", "_self");',
      element,
    );
    await element.click();

    return new Security(this.driver).wait();
  }

  private getHeader(): WebElementPromise {
    return this.findElement(By.css('h1'));
  }
}
