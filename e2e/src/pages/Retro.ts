import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './Page';
import RetroArchiveList from './RetroArchiveList';
import CBy from '../helpers/customBy';
import customUntil from '../helpers/customUntil';

const untilNoPopup = customUntil.noElementLocated(By.css('.popup-overlay'));

export default class Retro extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}`, '.page-retro');
    this.slug = slug;
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

  public async toggleActionItemDone(index: number): Promise<void> {
    const items = await this.getActionItems();
    await items[index].findElement(By.css('.toggle-done')).click();
  }

  public async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(items.map(
      (item) => item.findElement(By.css('.message')).getText(),
    ));
  }

  public async performArchive(): Promise<void> {
    await this.driver.findElement(CBy.buttonText('Create Archive')).click();
    await this.driver.findElement(CBy.buttonText('Archive')).click();
    await this.driver.wait(untilNoPopup);
  }

  public async clickViewArchives(): Promise<RetroArchiveList> {
    await this.driver.findElement(By.linkText('Archives')).click();

    return new RetroArchiveList(this.driver, this.slug).wait();
  }
}
