import { type WebDriver, type Locator } from 'selenium-webdriver';

export const untilNoElementLocated =
  (locator: Locator) => async (driver: WebDriver) => {
    const elements = await driver.findElements(locator);
    return elements.length === 0;
  };
