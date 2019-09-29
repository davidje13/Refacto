import { By, WebDriver } from 'selenium-webdriver';
import Page from './common/Page';
import Retro from './Retro';

export default class Password extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}`, '.page-password');
    this.slug = slug;
  }

  public setPassword(pass: string): Promise<void> {
    return this.setFormValue(By.css('form input[type=password]'), pass);
  }

  public async submit(): Promise<Retro> {
    await this.click(By.css('form button'));

    return new Retro(this.driver, this.slug).wait();
  }
}
