import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroCreate } from './RetroCreate';
import { Welcome } from './Welcome';
import { SsoLogin } from './SsoLogin';
import { Retro } from './Retro';

export class RetroList extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/retros', '.page-retro-list');
  }

  public async clickLoginWithGoogle() {
    await this.click(By.css('.sso-google'));

    return new SsoLogin<RetroList>(this.driver, RetroList).wait();
  }

  public async loginAs(identifier: string) {
    await this.click(By.css('.sso-google'));

    const loginSso = await new SsoLogin<RetroList>(
      this.driver,
      RetroList,
    ).wait();
    return loginSso.loginAs(identifier);
  }

  public async clickHome() {
    await this.click(By.linkText('Home'));

    return new Welcome(this.driver).wait();
  }

  public async clickCreateRetro() {
    await this.click(By.linkText('Create Retro'));

    return new RetroCreate(this.driver).wait();
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

  private getRetroItems() {
    return this.findElements(By.css('.retro-link'));
  }

  private async getRetroItemAtIndex(index: number) {
    const all = await this.getRetroItems();
    return all[index];
  }
}
