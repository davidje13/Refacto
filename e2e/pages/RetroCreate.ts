import { By, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { Retro } from './Retro';
import { Welcome } from './Welcome';

export class RetroCreate extends Page {
  declare private slug?: string;

  constructor(driver: WebDriver) {
    super(driver, '/create', '.page-retro-create');
  }

  async clickAccount() {
    await this.click(By.linkText('Account'));

    return new Welcome(this.driver).wait();
  }

  setName(name: string) {
    return this.setFormValue(By.css('form input[name=name]'), name);
  }

  setSlug(slug: string) {
    this.slug = slug;
    return this.setFormValue(By.css('form input[name=slug]'), slug);
  }

  setPassword(pass: string) {
    return this.setFormValue(By.css('form input[name=password]'), pass);
  }

  setPasswordConfirmation(pass: string) {
    return this.setFormValue(
      By.css('form input[name=password-confirmation]'),
      pass,
    );
  }

  async submit() {
    await this.click(By.css('form button'));

    return new Retro(this.driver, this.slug || 'unknown').wait();
  }
}
