import { By, WebDriver } from 'selenium-webdriver';
import Page from './Page';

type Constructable<T> = new(driver: WebDriver) => T;

export default class Login<TargetPageT extends Page> extends Page {
  public constructor(
    driver: WebDriver,
    private readonly ExpectedTarget: Constructable<TargetPageT>,
  ) {
    super(driver, '/', 'input[name=identifier]');
  }

  public setIdentifier(identifier: string): Promise<void> {
    return this.setFormValue(By.css('form input[name=identifier]'), identifier);
  }

  public async submit(): Promise<TargetPageT> {
    this.click(By.css('form button'));

    const page = new this.ExpectedTarget(this.driver);
    await page.wait();
    return page;
  }
}