import { By } from 'selenium-webdriver';
import Page from './Page';

export default class Retro extends Page {
  constructor(driver, slug) {
    super(driver, `/retros/${slug}`, '.page-retro');
  }

  getName() {
    return this.driver.findElement(By.css('.top-header h1'));
  }

  getNameText() {
    return this.getName().getText();
  }

  setActionItemText(value) {
    this.setFormValue(By.css('.actions .text-entry textarea'), value);
  }

  submitActionItem() {
    this.click(By.css('.actions .text-entry button'));
  }

  getActionItems() {
    return this.driver.findElements(By.css('.action-item'));
  }

  async getActionItemLabels() {
    const items = await this.getActionItems();
    return Promise.all(items.map(
      (item) => item.findElement(By.css('.message')).getText(),
    ));
  }
}
