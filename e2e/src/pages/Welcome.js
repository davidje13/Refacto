import { By } from 'selenium-webdriver';
import Page from './Page';
import RetroCreate from './RetroCreate';
import Login from './Login';

export default class Welcome extends Page {
  constructor(driver) {
    super(driver, '/', '.page-welcome');
  }

  getHeader() {
    return this.driver.findElement(By.css('h1'));
  }

  getHeaderText() {
    return this.getHeader().getText();
  }

  async clickCreateRetro() {
    await this.click(By.css('.link-create'));

    const page = new RetroCreate(this.driver);
    await page.wait();
    return page;
  }

  async clickLoginWithGoogle() {
    await this.click(By.css('.sso-google'));

    const page = new Login(this.driver, RetroCreate);
    await page.wait();
    return page;
  }
}
