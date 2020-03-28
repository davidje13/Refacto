import type { WebDriver } from 'selenium-webdriver';
import WrappedDriver from './common/WrappedDriver';
import Welcome from './Welcome';
import Password from './Password';
import RetroList from './RetroList';

export default class SiteMap extends WrappedDriver {
  public constructor(driver: WebDriver) {
    super(driver);
  }

  public navigateToWelcome(): Promise<Welcome> {
    return new Welcome(this.driver).load();
  }

  public navigateToRetroList(): Promise<RetroList> {
    return new RetroList(this.driver).load();
  }

  public navigateToRetroPassword(slug: string): Promise<Password> {
    return new Password(this.driver, slug).load();
  }
}
