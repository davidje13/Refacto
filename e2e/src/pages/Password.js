import { By } from 'selenium-webdriver';
import Page from './Page';
import Retro from './Retro';

export default class Password extends Page {
  constructor(driver, slug) {
    super(driver, `/retros/${slug}`, '.page-password');
  }

  setPassword(pass) {
    return this.driver.findElement(By.css('form input[type=password]'))
      .sendKeys(pass);
  }

  async submit() {
    this.driver.findElement(By.css('form button')).click();

    const page = new Retro(this.driver, 'unknown');
    await page.wait();
    return page;
  }
}
