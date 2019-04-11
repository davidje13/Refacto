import { By } from 'selenium-webdriver';
import Page from './Page';
import Retro from './Retro';

export default class RetroCreate extends Page {
  constructor(driver) {
    super(driver, '/create', '.page-retro-create');
  }

  setName(name) {
    return this.setFormValue(By.css('form input[name=name]'), name);
  }

  setSlug(slug) {
    return this.setFormValue(By.css('form input[name=slug]'), slug);
  }

  setPassword(pass) {
    return this.setFormValue(By.css('form input[name=password]'), pass);
  }

  setPasswordConfirmation(pass) {
    return this.setFormValue(By.css('form input[name=password-confirmation]'), pass);
  }

  async submit() {
    this.click(By.css('form button'));

    const page = new Retro(this.driver, 'unknown');
    await page.wait();
    return page;
  }
}
