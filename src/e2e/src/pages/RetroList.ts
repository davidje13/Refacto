import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Page from './common/Page';
import RetroCreate from './RetroCreate';
import Welcome from './Welcome';
import SsoLogin from './SsoLogin';
import Retro from './Retro';

export default class RetroList extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/retros', '.page-retro-list');
  }

  public async clickLoginWithGoogle(): Promise<SsoLogin<RetroList>> {
    await this.click(By.css('.sso-google'));

    return new SsoLogin<RetroList>(this.driver, RetroList).wait();
  }

  public async loginAs(identifier: string): Promise<RetroList> {
    await this.click(By.css('.sso-google'));

    const loginSso = await new SsoLogin<RetroList>(this.driver, RetroList).wait();
    return loginSso.loginAs(identifier);
  }

  public async clickHome(): Promise<Welcome> {
    await this.click(By.linkText('Home'));

    return new Welcome(this.driver).wait();
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.linkText('Create Retro'));

    return new RetroCreate(this.driver).wait();
  }

  public async getRetroNames(): Promise<string[]> {
    const items = await this.getRetroItems();
    return Promise.all(items.map((item) => item.getText()));
  }

  public async clickRetroNamed(name: string): Promise<Retro> {
    const names = await this.getRetroNames();
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`No retro named ${name}`);
    }

    const item = await this.getRetroItemAtIndex(index);
    await item.click();

    return new Retro(this.driver, 'unknown').wait();
  }

  private getRetroItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.retro-link'));
  }

  private async getRetroItemAtIndex(index: number): Promise<WebElement> {
    const all = await this.getRetroItems();
    return all[index];
  }
}
