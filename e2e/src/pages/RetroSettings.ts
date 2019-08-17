import { By, WebDriver } from 'selenium-webdriver';
import Page from './common/Page';
import CBy from '../helpers/customBy';

export default class RetroSettings extends Page {
  private readonly slug: string;

  public constructor(driver: WebDriver, slug: string) {
    super(driver, `/retros/${slug}/settings`, '.page-retro-settings');
    this.slug = slug;
  }

  public setName(name: string): Promise<void> {
    return this.setFormValue(By.css('input[name=name]'), name);
  }

  public clickSave(): Promise<void> {
    return this.click(CBy.buttonText('Save'));
  }
}
