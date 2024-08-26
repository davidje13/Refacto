import { By, WebDriver } from 'selenium-webdriver';
import { Page } from './common/Page';

type Constructable<T> = new (driver: WebDriver) => T;

export class SsoLogin<TargetPageT extends Page> extends Page {
  public constructor(
    driver: WebDriver,
    private readonly ExpectedTarget: Constructable<TargetPageT>,
  ) {
    super(driver, '/', 'input[name=identifier]');
  }

  public setIdentifier(identifier: string) {
    return this.setFormValue(By.css('form input[name=identifier]'), identifier);
  }

  public async submit(): Promise<TargetPageT> {
    await this.click(By.css('form button'));

    // An unknown bug in chromedriver causes communication with the browser to hang for
    // exactly 5 seconds at this point, so use at least a 6 second timeout to avoid flakiness:
    return new this.ExpectedTarget(this.driver).wait(6000);
  }

  public async loginAs(identifier: string): Promise<TargetPageT> {
    await this.setIdentifier(identifier);
    return this.submit();
  }
}
