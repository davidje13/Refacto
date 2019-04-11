import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env.HEADLESS !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;

const chromeOptions = new chrome.Options()
  .windowSize({ width, height });
const firefoxOptions = new firefox.Options()
  .windowSize({ width, height });

if (headless) {
  chromeOptions.headless();
  firefoxOptions.headless();
}

export default function buildDriver() {
  return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .build();
}
