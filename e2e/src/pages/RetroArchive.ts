import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './common/Page';

export default class RetroArchive extends Page {
  public constructor(driver: WebDriver, slug: string, archiveId: string) {
    super(driver, `/retros/${slug}/archives/${archiveId}`, '.page-archive');
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
