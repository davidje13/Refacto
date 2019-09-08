import { By, WebDriver } from 'selenium-webdriver';
import Page from './common/Page';
import Retro from './Retro';
import Welcome from './Welcome';
import RetroList from './RetroList';

export default class RetroCreate extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/create', '.page-retro-create');
  }

  public async clickHome(): Promise<Welcome> {
    await this.click(By.linkText('Home'));

    return new Welcome(this.driver).wait();
  }

  public async clickListRetros(): Promise<RetroList> {
    await this.click(By.linkText('My Retros'));

    return new RetroList(this.driver).wait();
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
    await this.click(By.css('form button'));

    return new Retro(this.driver, 'unknown').wait();
  }
}
