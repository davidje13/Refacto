import { By, WebDriver } from 'selenium-webdriver';
import Page from './common/Page';
import CBy from '../helpers/customBy';
import Retro from './Retro';

export default class RetroSettings extends Page {
  private slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}/settings`, '.page-retro-settings');
    this.slug = slug;
  }

  public setName(name: string): Promise<void> {
    return this.setFormValue(By.css('input[name=name]'), name);
  }

  public setSlug(slug: string): Promise<void> {
    this.slug = slug;
    return this.setFormValue(By.css('input[name=slug]'), slug);
  }

  public async clickSave(): Promise<Retro> {
    await this.click(CBy.buttonText('Save'));

    return new Retro(this.driver, this.slug).wait();
  }
}
