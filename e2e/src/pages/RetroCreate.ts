import { By, WebDriver } from 'selenium-webdriver';
import Page from './Page';
import Retro from './Retro';

export default class RetroCreate extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/create', '.page-retro-create');
  }

  public setName(name: string): Promise<void> {
    return this.setFormValue(By.css('form input[name=name]'), name);
  }

  public setSlug(slug: string): Promise<void> {
    return this.setFormValue(By.css('form input[name=slug]'), slug);
  }

  public setPassword(pass: string): Promise<void> {
    return this.setFormValue(By.css('form input[name=password]'), pass);
  }

  public setPasswordConfirmation(pass: string): Promise<void> {
    return this.setFormValue(By.css('form input[name=password-confirmation]'), pass);
  }

  public async submit(): Promise<Retro> {
    this.click(By.css('form button'));

    return new Retro(this.driver, 'unknown').wait();
  }
}
