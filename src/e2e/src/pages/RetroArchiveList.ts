import { By, WebDriver, WebElement } from 'selenium-webdriver';
import Page from './common/Page';
import RetroArchive from './RetroArchive';
import Retro from './Retro';
import { waitForFile } from '../helpers/downloads';

export default class RetroArchiveList extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}/archives`, '.page-archive-list');
    this.slug = slug;
  }

  public async clickBack(): Promise<Retro> {
    await this.click(By.linkText('Back to Retro'));

    return new Retro(this.driver, this.slug).wait();
  }

  public async clickExportJson(): Promise<string> {
    await this.click(By.linkText('Export as JSON'));
    return waitForFile(`${this.slug}-export.json`, this.explicitWaitTimeout);
  }

  public async getArchiveLabels(): Promise<string[]> {
    const items = await this.getArchiveItems();
    return Promise.all(items.map((item) => item.getText()));
  }

  public async clickArchiveAtIndex(index: number): Promise<RetroArchive> {
    const item = await this.getArchiveItemAtIndex(index);
    await item.click();

    return new RetroArchive(this.driver, this.slug, 'unknown').wait();
  }

  private getArchiveItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.archive-link'));
  }

  private async getArchiveItemAtIndex(index: number): Promise<WebElement> {
    const all = await this.getArchiveItems();
    return all[index];
  }
}
