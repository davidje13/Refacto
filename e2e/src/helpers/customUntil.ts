import { WebDriver, By } from 'selenium-webdriver';

type WaitCondition = (driver: WebDriver) => Promise<boolean>;

export default {
  noElementLocated: (
    by: By,
  ): WaitCondition => async (driver: WebDriver): Promise<boolean> => {
    const elements = await driver.findElements(by);
    return elements.length === 0;
  },
};
