import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Page from './Page';
import RetroArchive from './RetroArchive';

export default class RetroArchiveList extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}/archives`, '.page-archive-list');
    this.slug = slug;
  }

  public getArchiveItems(): Promise<WebElement[]> {
    return this.driver.findElements(By.css('.archive-link'));
  }

  public async getArchiveLabels(): Promise<string[]> {
    const items = await this.getArchiveItems();
    return Promise.all(items.map((item) => item.getText()));
  }

  public async getArchiveItemAtIndex(index: number): Promise<WebElement> {
    const all = await this.getArchiveItems();
    return all[index];
  }

  public async clickArchiveAtIndex(index: number): Promise<RetroArchive> {
    const item = await this.getArchiveItemAtIndex(index);
    await item.click();

    return new RetroArchive(this.driver, this.slug, 'unknown').wait();
  }
}
