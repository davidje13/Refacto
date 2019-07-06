import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Page from './Page';
import Password from './Password';
import RetroCreate from './RetroCreate';

export default class RetroList extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/retros', '.page-retro-list');
  }

  public getRetroItems(): Promise<WebElement[]> {
    return this.driver.findElements(By.css('.retro-link'));
  }

  public async getRetroItemAtIndex(index: number): Promise<WebElement> {
    const all = await this.getRetroItems();
    return all[index];
  }

  public async clickRetroAtIndex(index: number): Promise<Password> {
    const item = await this.getRetroItemAtIndex(index);
    await item.click();

    const page = new Password(this.driver, 'unknown');
    await page.wait();
    return page;
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.linkText('Create Retro'));

    const page = new RetroCreate(this.driver);
    await page.wait();
    return page;
  }
}
