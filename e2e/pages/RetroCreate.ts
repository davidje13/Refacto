import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { Retro } from './Retro';
import { RetroList } from './RetroList';

export class RetroCreate extends Page {
  private slug?: string;

  public constructor(driver: WebDriver) {
    super(driver, '/create', '.page-retro-create');
  }

  public async clickListRetros() {
    await this.click(By.linkText('My Retros'));

    return new RetroList(this.driver).wait();
  }

  public setName(name: string) {
    return this.setFormValue(By.css('form input[name=name]'), name);
  }

  public setSlug(slug: string) {
    this.slug = slug;
    return this.setFormValue(By.css('form input[name=slug]'), slug);
  }

  public setPassword(pass: string) {
    return this.setFormValue(By.css('form input[name=password]'), pass);
  }

  public setPasswordConfirmation(pass: string) {
    return this.setFormValue(
      By.css('form input[name=password-confirmation]'),
      pass,
    );
  }

  public async submit() {
    await this.click(By.css('form button'));

    return new Retro(this.driver, this.slug || 'unknown').wait();
  }
}
