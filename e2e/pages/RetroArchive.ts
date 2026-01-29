import { By, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroArchiveList } from './RetroArchiveList';

export class RetroArchive extends Page {
  declare private readonly slug: string;

  constructor(driver: WebDriver, slug: string, archiveId: string) {
    super(
      driver,
      `/retros/${encodeURIComponent(slug)}/archives/${encodeURIComponent(archiveId)}`,
      '.page-archive',
    );
    this.slug = slug;
  }

  async clickBack() {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  getNameText() {
    return this.getName().getText();
  }

  async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(
      items.map((item) => item.findElement(By.css('.message')).getText()),
    );
  }

  private getName() {
    return this.findElement(By.css('.top-header h1'));
  }

  private getActionItems() {
    return this.findElements(By.css('.action-item'));
  }
}
