import { By, Key, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { PageFragment } from './common/PageFragment';
import { RetroArchiveList } from './RetroArchiveList';
import { RetroSettings } from './RetroSettings';
import { byButtonText } from '../helpers/customBy';
import { headless } from '../helpers/selenium';

class ItemEntry extends PageFragment {
  setText(value: string) {
    return this.setFormValue(By.css('textarea'), value);
  }

  submit() {
    return this.click(By.css('button'));
  }

  async enter(value: string) {
    await this.setText(value);
    await this.submit();
  }
}

export class Retro extends Page {
  constructor(
    driver: WebDriver,
    private readonly slug: string,
  ) {
    super(driver, `/retros/${encodeURIComponent(slug)}`, '.page-retro');
  }

  getNameText() {
    return this.getName().getText();
  }

  getHappyItemEntry() {
    return new ItemEntry(this.driver, By.css('.happy .text-entry'));
  }

  getMehItemEntry() {
    return new ItemEntry(this.driver, By.css('.meh .text-entry'));
  }

  getSadItemEntry() {
    return new ItemEntry(this.driver, By.css('.sad .text-entry'));
  }

  getActionItemEntry() {
    return new ItemEntry(this.driver, By.css('.actions .text-entry'));
  }

  async toggleActionItemDone(index: number) {
    const items = await this.getActionItems();
    const item = items[index];
    if (!item) {
      throw new Error(`No action item at index ${index}`);
    }
    await item.findElement(By.css('.toggle-done')).click();
  }

  async getActionItemLabels(): Promise<string[]> {
    const items = await this.getActionItems();
    return Promise.all(
      items.map((item) => item.findElement(By.css('.message')).getText()),
    );
  }

  async focusMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.message')).click();
  }

  async cancelMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.cancel')).click();
  }

  async continueMoodItem(index: number) {
    const item = await this.getMoodItemAtIndex(index);
    await item.findElement(By.css('.continue')).click();
  }

  pressReturn() {
    return this.sendKeys(Key.RETURN);
  }

  pressEscape() {
    return this.sendKeys(Key.ESCAPE);
  }

  pressLeftArrow() {
    return this.sendKeys(Key.ARROW_LEFT);
  }

  pressRightArrow() {
    return this.sendKeys(Key.ARROW_RIGHT);
  }

  async getMoodItemLabels(): Promise<string[]> {
    const items = await this.getMoodItems();
    return Promise.all(
      items.map((item) => item.findElement(By.css('.message')).getText()),
    );
  }

  getBeginDiscussionPopup() {
    return this.getPopup('popup-begin');
  }

  getArchivePopup() {
    return this.getPopup('popup-archive');
  }

  async performArchive() {
    const popup = this.getArchivePopup();
    if (!(await popup.exists())) {
      await this.click(byButtonText('Create Archive'));
    }

    await popup.clickButton('Archive');
    await popup.waitUntilDismissed();
    if (!headless) {
      await this.driver.sleep(2500); // wait for animation to complete
    }
  }

  async clickViewArchives() {
    await this.click(By.linkText('Archives'));

    return new RetroArchiveList(this.driver, this.slug).wait();
  }

  async clickSettings() {
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
