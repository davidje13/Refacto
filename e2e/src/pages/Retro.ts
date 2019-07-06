import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './Page';

export default class Retro extends Page {
  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}`, '.page-retro');
  }

  public getName(): WebElementPromise {
    return this.driver.findElement(By.css('.top-header h1'));
  }

  public getNameText(): Promise<string> {
    return this.getName().getText();
  }

  public setActionItemText(value: string): Promise<void> {
    return this.setFormValue(By.css('.actions .text-entry textarea'), value);
  }

  public submitActionItem(): Promise<void> {
    return this.click(By.css('.actions .text-entry button'));
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
