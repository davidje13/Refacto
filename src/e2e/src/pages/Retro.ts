import { By, Key, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { PageFragment } from './common/PageFragment';
import { RetroArchiveList } from './RetroArchiveList';
import { RetroSettings } from './RetroSettings';
import { byButtonText } from '../helpers/customBy';

class ItemEntry extends PageFragment {
  public setText(value: string) {
    return this.setFormValue(By.css('textarea'), value);
  }

  public submit() {
    return this.click(By.css('button'));
  }

  public async enter(value: string) {
    await this.setText(value);
    await this.submit();
  }
}

export class Retro extends Page {
  public constructor(driver: WebDriver, private readonly slug: string) {
    super(driver, `/retros/${slug}`, '.page-retro');
  }

  public getNameText() {
    return this.getName().getText();
  }

  public getHappyItemEntry() {
    return new ItemEntry(this.driver, By.css('.happy .text-entry'));
  }

  public getMehItemEntry() {
    return new ItemEntry(this.driver, By.css('.meh .text-entry'));
  }

  public getSadItemEntry() {
    return new ItemEntry(this.driver, By.css('.sad .text-entry'));
  }

  public getActionItemEntry() {
    return new ItemEntry(this.driver, By.css('.actions .text-entry'));
  }

  public async toggleActionItemDone(index: number) {
    const items = await this.getActionItems();
    const item = items[index];
    if (!item) {
      throw new Error(`No action item at index ${index}`);
    }
    await item.findElement(By.css('.toggle-done')).click();
  }

  public async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(
      items.map((item) => item.findElement(By.css('.message')).getText()),
    );
  }

  public async focusMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.message')).click();
  }

  public async cancelMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.cancel')).click();
  }

  public async continueMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.continue')).click();
  }

  public pressReturn() {
    return this.sendKeys(Key.RETURN);
  }

  public pressEscape() {
    return this.sendKeys(Key.ESCAPE);
  }

  public pressLeftArrow() {
    return this.sendKeys(Key.ARROW_LEFT);
  }

  public pressRightArrow() {
    return this.sendKeys(Key.ARROW_RIGHT);
  }

  public async getMoodItemLabels(): Promise<string[]> {
    const items = await this.getMoodItems();
    return Promise.all(
      items.map((item) => item.findElement(By.css('.message')).getText()),
    );
  }

  public getArchivePopup() {
    return this.getPopup('popup-archive');
  }

  public async performArchive() {
    const popup = this.getArchivePopup();
    if (!(await popup.exists())) {
      await this.click(byButtonText('Create Archive'));
    }

    await popup.clickButton('Archive');
    await popup.waitUntilDismissed();
  }

  public async clickViewArchives() {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  public async clickSettings() {
    await this.click(By.linkText('Settings'));

    return new RetroSettings(this.driver, this.slug).wait();
  }

  private getName() {
    return this.findElement(By.css('.top-header h1'));
  }

  private getActionItems() {
    return this.findElements(By.css('.action-item'));
  }

  private getMoodItems() {
    return this.findElements(By.css('.mood-item'));
  }

  private async getMoodItemAtIndex(index: number) {
    const items = await this.getMoodItems();
    const item = items[index];
    if (!item) {
      throw new Error(`No mood item at index ${index}`);
    }
    return item;
  }
}
