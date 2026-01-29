import { By, type WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';
import { byButtonText } from '../helpers/customBy';
import { Retro } from './Retro';

export class RetroSettings extends Page {
  constructor(
    driver: WebDriver,
    private slug: string,
  ) {
    super(
      driver,
      `/retros/${encodeURIComponent(slug)}/settings`,
      '.page-retro-settings',
    );
  }

  setName(name: string) {
    return this.setFormValue(By.css('input[name=name]'), name);
  }

  setSlug(slug: string) {
    this.slug = slug;
    return this.setFormValue(By.css('input[name=slug]'), slug);
  }

  async clickSave() {
    await this.click(byButtonText('Save'));

    return new Retro(this.driver, this.slug).wait();
  }
}
