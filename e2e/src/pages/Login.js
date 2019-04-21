import { By } from 'selenium-webdriver';
import Page from './Page';

export default class Login extends Page {
  constructor(driver, ExpectedTarget) {
    super(driver, '/', 'input[name=identifier]');
    this.ExpectedTarget = ExpectedTarget;
  }

  setIdentifier(identifier) {
    return this.setFormValue(By.css('form input[name=identifier]'), identifier);
  }

  async submit() {
    this.click(By.css('form button'));

    const page = new this.ExpectedTarget(this.driver);
    await page.wait();
    return page;
  }
}
