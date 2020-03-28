import type { WebDriver, By } from 'selenium-webdriver';

export default {
  noElementLocated: (by: By) => async (driver: WebDriver): Promise<boolean> => {
    const elements = await driver.findElements(by);
    return elements.length === 0;
  },
};
