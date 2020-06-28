import webdriver, { WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { downloadDir } from './downloads';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env.HEADLESS !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;

const chromeOptions = new chrome.Options()
  .windowSize({ width, height })
  .setUserPreferences({
    'profile.default_content_settings.popups': 0,
    'download.prompt_for_download': false,
    'download.default_directory': downloadDir,
  });

const firefoxOptions = new firefox.Options()
  .windowSize({ width, height })
  .setPreference('browser.download.dir', downloadDir)
  .setPreference('browser.download.folderList', 2)
  .setPreference('browser.download.useDownloadDir', true)
  .setPreference('browser.helperApps.neverAsk.saveToDisk', 'application/json');

if (process.env.DOCKER === 'true') {
  // Prevent crashes in Docker
  // (see https://developers.google.com/web/tools/puppeteer/troubleshooting#tips)
  chromeOptions.addArguments('disable-dev-shm-usage', 'no-sandbox');
}

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
