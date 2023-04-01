import type { WebDriver, By } from 'selenium-webdriver';

export const untilNoElementLocated = (by: By) => async (driver: WebDriver) => {
  const elements = await driver.findElements(by);
  return elements.length === 0;
};
