import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env.HEADLESS !== 'false';

const chromeOptions = new chrome.Options();
const firefoxOptions = new firefox.Options();

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
