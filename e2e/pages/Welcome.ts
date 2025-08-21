import { By, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroCreate } from './RetroCreate';
import { SsoLogin } from './SsoLogin';
import { Security } from './Security';
import { Retro } from './Retro';

export class Welcome extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-welcome');
  }

  public getHeaderText() {
    return this.getHeader().getText();
  }

  public async getRetroNames(): Promise<string[]> {
    const items = await this.getRetroItems();
    return Promise.all(items.map((item) => item.getText()));
  }

  public async clickRetroNamed(name: string) {
    const names = await this.getRetroNames();
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`No retro named ${name}`);
    }

    const item = await this.getRetroItemAtIndex(index);
    await item.click();

    return new Retro(this.driver, 'unknown').wait();
  }

  public async clickCreateRetro() {
    await this.click(By.css('.link-create'));

    return new RetroCreate(this.driver).wait();
  }

  public async clickLoginWithGoogle<K extends keyof typeof LoginTargets>(
    expectation: K,
  ): Promise<SsoLogin<InstanceType<(typeof LoginTargets)[K]>>> {
    await this.click(By.css('.sso-google'));

    return new SsoLogin(
      this.driver,
      LoginTargets[expectation] as any,
    ).wait() as any;
  }

  public async loginAs<K extends keyof typeof LoginTargets>(
    userName: string,
    expectation: K,
  ): Promise<InstanceType<(typeof LoginTargets)[K]>> {
    const ssoLogin = await this.clickLoginWithGoogle(expectation);
    return await ssoLogin.loginAs(userName);
  }

  public async clickSecurity() {
    const element = this.findElement(
      By.linkText('Privacy & Security information'),
    );
    // avoid opening a new tab, as this is difficult to manage
    await this.driver.executeScript(
      'arguments[0].setAttribute("target", "_self");',
      element,
    );
    await element.click();

    return new Security(this.driver).wait();
  }

  private getRetroItems() {
    return this.findElements(By.css('.retro-link'));
  }

  private async getRetroItemAtIndex(index: number) {
    const items = await this.getRetroItems();
    const item = items[index];
    if (!item) {
      throw new Error(`No retro item at index ${index}`);
    }
    return item;
  }

  private getHeader() {
    return this.findElement(By.css('h1'));
  }
}

const LoginTargets = {
  hasRetros: Welcome,
  noRetros: RetroCreate,
};
