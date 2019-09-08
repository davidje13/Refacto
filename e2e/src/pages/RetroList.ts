import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Page from './common/Page';
import Password from './Password';
import RetroCreate from './RetroCreate';
import Welcome from './Welcome';

export default class RetroList extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/retros', '.page-retro-list');
  }

  public async clickHome(): Promise<Welcome> {
    await this.click(By.linkText('Home'));

    return new Welcome(this.driver).wait();
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.linkText('Create Retro'));

    return new RetroCreate(this.driver).wait();
  }

  public async clickRetroAtIndex(index: number): Promise<Password> {
    const item = await this.getRetroItemAtIndex(index);
    await item.click();

    return new Password(this.driver, 'unknown').wait();
  }

  private getRetroItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.retro-link'));
  }

  private async getRetroItemAtIndex(index: number): Promise<WebElement> {
    const all = await this.getRetroItems();
    return all[index];
  }
}
