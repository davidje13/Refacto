import { By } from 'selenium-webdriver';
import Page from './Page';
import Password from './Password';
import RetroCreate from './RetroCreate';

export default class RetroList extends Page {
  constructor(driver) {
    super(driver, '/retros', '.page-retro-list');
  }

  getRetroItems() {
    return this.driver.findElements(By.css('.retro-link'));
  }

  async getRetroItemAtIndex(index) {
    const all = await this.getRetroItems();
    return all[index];
  }

  async clickRetroAtIndex(index) {
    const item = await this.getRetroItemAtIndex(index);
    await item.click();

    const page = new Password(this.driver, 'unknown');
    await page.wait();
    return page;
  }

  async clickCreateRetro() {
    await this.click(By.linkText('Create Retro'));

    const page = new RetroCreate(this.driver);
    await page.wait();
    return page;
  }
}
