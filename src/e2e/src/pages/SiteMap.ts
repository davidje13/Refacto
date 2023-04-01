import type { WebDriver } from 'selenium-webdriver';
import { Welcome } from './Welcome';
import { Password } from './Password';
import { RetroList } from './RetroList';

export class SiteMap {
  public constructor(public readonly driver: WebDriver) {}

  public navigateToWelcome() {
    return new Welcome(this.driver).load();
  }

  public navigateToRetroList() {
    return new RetroList(this.driver).load();
  }

  public navigateToRetroPassword(slug: string) {
    return new Password(this.driver, slug).load();
  }

  public close() {
    return this.driver.quit();
  }
}
