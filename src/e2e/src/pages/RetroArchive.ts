import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './common/Page';
import RetroArchiveList from './RetroArchiveList';

export default class RetroArchive extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string, archiveId: string) {
    super(driver, `/retros/${slug}/archives/${archiveId}`, '.page-archive');
    this.slug = slug;
  }

  public async clickBack(): Promise<RetroArchiveList> {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  public getNameText(): Promise<string> {
    return this.getName().getText();
  }

  public async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(items.map(
      (item) => item.findElement(By.css('.message')).getText(),
    ));
  }

  private getName(): WebElementPromise {
    return this.findElement(By.css('.top-header h1'));
  }

  private getActionItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.action-item'));
  }
}
