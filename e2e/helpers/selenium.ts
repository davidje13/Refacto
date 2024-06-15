import { Builder as WebDriverBuilder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { downloadDir } from './downloads';
import 'chromedriver';
import 'geckodriver';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env['HEADLESS'] !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;

const chromeOptions = new ChromeOptions();
chromeOptions.windowSize({ width, height });
chromeOptions.setUserPreferences({
  'profile.default_content_settings.popups': 0,
  'download.prompt_for_download': false,
  'download.default_directory': downloadDir,
});

const firefoxOptions = new FirefoxOptions()
  .windowSize({ width, height })
  .setPreference('browser.download.dir', downloadDir)
  .setPreference('browser.download.folderList', 2)
  .setPreference('browser.download.useDownloadDir', true)
  .setPreference('browser.helperApps.neverAsk.saveToDisk', 'application/json');

if (process.env['DOCKER'] === 'true') {
  // Prevent crashes in Docker
  // (see https://developers.google.com/web/tools/puppeteer/troubleshooting#tips)
  chromeOptions.addArguments('disable-dev-shm-usage', 'no-sandbox');
}

if (headless) {
  chromeOptions.addArguments('--headless=new');
  firefoxOptions.addArguments('--headless');
}

export const buildDriver = () =>
  new WebDriverBuilder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .build();
