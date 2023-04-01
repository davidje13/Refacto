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

    return new this.ExpectedTarget(this.driver).wait();
  }

  public async loginAs(identifier: string): Promise<TargetPageT> {
    await this.setIdentifier(identifier);
    return this.submit();
  }
}
