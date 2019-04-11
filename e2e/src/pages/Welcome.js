import { By } from 'selenium-webdriver';
import Page from './Page';
import RetroList from './RetroList';

export default class Welcome extends Page {
  constructor(driver) {
    super(driver, '/', '.page-welcome');
  }

  getHeader() {
    return this.driver.findElement(By.css('h1'));
  }

  getHeaderText() {
    return this.getHeader().getText();
  }

  async clickRetroList() {
    await this.click(By.css('.link-retro-list'));

    const page = new RetroList(this.driver);
    await page.wait();
    return page;
  }
}
