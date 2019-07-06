import webdriver, { WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env.HEADLESS !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;

// firefoxOptions is cast to `any` as a workaround for
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/28464

const chromeOptions = new chrome.Options()
  .windowSize({ width, height });
const firefoxOptions = (new firefox.Options() as any)
  .windowSize({ width, height });

if (headless) {
  chromeOptions.headless();
  firefoxOptions.headless();
}

export default function buildDriver(): WebDriver {
  return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .build();
}
