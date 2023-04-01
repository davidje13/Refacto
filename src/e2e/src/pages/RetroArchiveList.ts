import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroArchive } from './RetroArchive';
import { Retro } from './Retro';
import { waitForFile } from '../helpers/downloads';

export class RetroArchiveList extends Page {
  public constructor(driver: WebDriver, private readonly slug: string) {
    super(driver, `/retros/${slug}/archives`, '.page-archive-list');
  }

  public async clickBack() {
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

  public async clickArchiveAtIndex(index: number) {
    const item = await this.getArchiveItemAtIndex(index);
    await item.click();

    return new RetroArchive(this.driver, this.slug, 'unknown').wait();
  }

  private getArchiveItems() {
    return this.findElements(By.css('.archive-link'));
  }

  private async getArchiveItemAtIndex(index: number) {
    const all = await this.getArchiveItems();
    return all[index];
  }
}
