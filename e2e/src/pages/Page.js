import url from 'url';
import { By, until } from 'selenium-webdriver';
import customUntil from '../helpers/customUntil';

const HOST = process.env.TARGET_HOST;

const untilNoLoaders = customUntil.noElementLocated(By.css('.loader'));

function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export default class Page {
  constructor(driver, subpath, expectedCSS) {
    this.driver = driver;
    this.subpath = subpath;
    this.untilNavigated = until.elementLocated(By.css(expectedCSS));
  }

  async load() {
    const path = url.resolve(HOST, this.subpath);
    process.stdout.write(`Navigating to ${path}\n`);
    await this.driver.get(path);
    await this.wait();
    return this;
  }

  async wait() {
    await this.driver.wait(this.untilNavigated, 5000);
    await this.driver.wait(untilNoLoaders, 5000);
    // wait an additional frame to allow some async events (e.g. title changes)
    await sleep(100);
    return this;
  }

  getTitle() {
    return this.driver.getTitle();
  }

  setFormValue(selector, value) {
    return this.driver.findElement(selector).sendKeys(value);
  }

  click(selector) {
    return this.driver.findElement(selector).click();
  }

  async expectChange(fn) {
    const body = await this.driver.findElement(By.css('body'));
    const oldState = await body.getText();
    await fn();
    await this.driver.wait(async () => {
      const state = await body.getText();
      return state !== oldState;
    });
  }
}
