import { By } from 'selenium-webdriver';
import Page from './Page';

export default class Retro extends Page {
  constructor(driver, slug) {
    super(driver, `/retros/${slug}`, '.page-retro');
  }

  getName() {
    return this.driver.findElement(By.css('.retro-name'));
  }

  getNameText() {
    return this.getName().getText();
  }
}
