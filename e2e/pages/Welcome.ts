import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroCreate } from './RetroCreate';
import { SsoLogin } from './SsoLogin';
import { Security } from './Security';
import { RetroList } from './RetroList';

export class Welcome extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-welcome');
  }

  public getHeaderText() {
    return this.getHeader().getText();
  }

  public async clickCreateRetro() {
    await this.click(By.css('.link-create'));

    return new RetroCreate(this.driver).wait();
  }

  public async clickListRetros() {
    await this.click(By.linkText('My Retros'));

    return new RetroList(this.driver).wait();
  }

  public async clickLoginWithGoogle() {
    await this.click(By.css('.sso-google'));

    return new SsoLogin<RetroCreate>(this.driver, RetroCreate).wait();
  }

  public async loginAs(userName: string) {
    const ssoLogin = await this.clickLoginWithGoogle();
    return await ssoLogin.loginAs(userName);
  }

  public async clickSecurity() {
    const element = this.findElement(By.css('.link-security'));
    // avoid opening a new tab, as this is difficult to manage
    await this.driver.executeScript(
      'arguments[0].setAttribute("target", "_self");',
      element,
    );
    await element.click();

    return new Security(this.driver).wait();
  }

  private getHeader() {
    return this.findElement(By.css('h1'));
  }
}
