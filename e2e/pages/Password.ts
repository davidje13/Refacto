import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { Retro } from './Retro';

export class Password extends Page {
  public constructor(
    driver: WebDriver,
    private readonly slug: string,
  ) {
    super(driver, `/retros/${encodeURIComponent(slug)}`, '.page-password');
  }

  public setPassword(pass: string) {
    return this.setFormValue(By.css('form input[type=password]'), pass);
  }

  public async submit() {
    await this.click(By.css('form button'));

    return new Retro(this.driver, this.slug).wait();
  }
}
