import { By } from 'selenium-webdriver';
import Page from './Page';
import Retro from './Retro';

export default class Password extends Page {
  constructor(driver, slug) {
    super(driver, `/retros/${slug}`, '.page-password');
  }

  setPassword(pass) {
    return this.setFormValue(By.css('form input[type=password]'), pass);
  }

  async submit() {
    this.click(By.css('form button'));

    const page = new Retro(this.driver, 'unknown');
    await page.wait();
    return page;
  }
}
