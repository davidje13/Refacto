import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroCreate } from './RetroCreate';
import { Retro } from './Retro';

export class RetroList extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-retro-list');
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
    const items = await this.getRetroItems();
    const item = items[index];
    if (!item) {
      throw new Error(`No retro item at index ${index}`);
    }
    return item;
  }
}
