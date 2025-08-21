import { By, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { byButtonText } from '../helpers/customBy';
import { Retro } from './Retro';

export class RetroSettings extends Page {
  public constructor(
    driver: WebDriver,
    private slug: string,
  ) {
    super(
      driver,
      `/retros/${encodeURIComponent(slug)}/settings`,
      '.page-retro-settings',
    );
  }

  public setName(name: string) {
    return this.setFormValue(By.css('input[name=name]'), name);
  }

  public setSlug(slug: string) {
    this.slug = slug;
    return this.setFormValue(By.css('input[name=slug]'), slug);
  }

  public async clickSave() {
    await this.click(byButtonText('Save'));

    return new Retro(this.driver, this.slug).wait();
  }
}
