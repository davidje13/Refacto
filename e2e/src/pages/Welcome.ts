import { By, WebDriver, WebElementPromise } from 'selenium-webdriver';
import Page from './Page';
import RetroCreate from './RetroCreate';
import Login from './Login';

export default class Welcome extends Page {
  public constructor(driver: WebDriver) {
    super(driver, '/', '.page-welcome');
  }

  public getHeader(): WebElementPromise {
    return this.driver.findElement(By.css('h1'));
  }

  public getHeaderText(): Promise<string> {
    return this.getHeader().getText();
  }

  public async clickCreateRetro(): Promise<RetroCreate> {
    await this.click(By.css('.link-create'));

    const page = new RetroCreate(this.driver);
    await page.wait();
    return page;
  }

  public async clickLoginWithGoogle(): Promise<Login<RetroCreate>> {
    await this.click(By.css('.sso-google'));

    const page = new Login<RetroCreate>(this.driver, RetroCreate);
    await page.wait();
    return page;
  }
}
