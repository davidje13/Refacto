import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './Page';

export default class RetroArchive extends Page {
  public constructor(driver: WebDriver, slug: string, archiveId: string) {
    super(driver, `/retros/${slug}/archives/${archiveId}`, '.page-archive');
  }

  public getName(): WebElementPromise {
    return this.driver.findElement(By.css('.top-header h1'));
  }

  public getNameText(): Promise<string> {
    return this.getName().getText();
  }

  public getActionItems(): Promise<WebElement[]> {
    return this.driver.findElements(By.css('.action-item'));
  }

  public async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(items.map(
      (item) => item.findElement(By.css('.message')).getText(),
    ));
  }
}
