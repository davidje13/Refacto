import {
  By,
  WebDriver,
  WebElementPromise,
  WebElement,
} from 'selenium-webdriver';
import Page from './common/Page';
import PageFragment from './common/PageFragment';
import Popup from './common/Popup';
import RetroArchiveList from './RetroArchiveList';
import CBy from '../helpers/customBy';

class ItemEntry extends PageFragment {
  public setText(value: string): Promise<void> {
    return this.setFormValue(By.css('textarea'), value);
  }

  public submit(): Promise<void> {
    return this.click(By.css('button'));
  }

  public async enter(value: string): Promise<void> {
    await this.setText(value);
    await this.submit();
  }
}

export default class Retro extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}`, '.page-retro');
    this.slug = slug;
  }

  public getNameText(): Promise<string> {
    return this.getName().getText();
  }

  public getHappyItemEntry(): ItemEntry {
    return new ItemEntry(this.driver, By.css('.happy .text-entry'));
  }

  public getMehItemEntry(): ItemEntry {
    return new ItemEntry(this.driver, By.css('.meh .text-entry'));
  }

  public getSadItemEntry(): ItemEntry {
    return new ItemEntry(this.driver, By.css('.sad .text-entry'));
  }

  public getActionItemEntry(): ItemEntry {
    return new ItemEntry(this.driver, By.css('.actions .text-entry'));
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

  public async focusMoodItem(index: number): Promise<void> {
    const items = await this.getMoodItems();
    await items[index].findElement(By.css('.message')).click();
  }

  public async closeMoodItem(index: number): Promise<void> {
    const items = await this.getMoodItems();
    await items[index].findElement(By.css('.close')).click();
  }

  public async getMoodItemLabels(): Promise<string[]> {
    const items = await this.getMoodItems();
    return Promise.all(items.map(
      (item) => item.findElement(By.css('.message')).getText(),
    ));
  }

  public getArchivePopup(): Popup {
    return this.getPopup('popup-archive');
  }

  public async performArchive(): Promise<void> {
    const popup = this.getArchivePopup();
    if (!await popup.exists()) {
      await this.click(CBy.buttonText('Create Archive'));
    }

    await popup.clickButton('Archive');
    await popup.waitUntilDismissed();
  }

  public async clickViewArchives(): Promise<RetroArchiveList> {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  private getName(): WebElementPromise {
    return this.findElement(By.css('.top-header h1'));
  }

  private getActionItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.action-item'));
  }

  private getMoodItems(): Promise<WebElement[]> {
    return this.findElements(By.css('.mood-item'));
  }
}
