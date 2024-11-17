import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { RetroArchiveList } from './RetroArchiveList';

export class RetroArchive extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string, archiveId: string) {
    super(
      driver,
      `/retros/${encodeURIComponent(slug)}/archives/${encodeURIComponent(archiveId)}`,
      '.page-archive',
    );
    this.slug = slug;
  }

  public async clickBack() {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  public getNameText() {
    return this.getName().getText();
  }

  public async getActionItemLabels(): Promise<string[]> {
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
