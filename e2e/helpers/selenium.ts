import { Builder as WebDriverBuilder, logging } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { downloadDir } from './downloads';
import 'chromedriver';
import 'geckodriver';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env['HEADLESS'] !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;
const headlessUserAgent = 'HeadlessEndToEndTest';

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
  // (see https://developer.chrome.com/docs/puppeteer/troubleshooting/#best_practices_with_docker)
  chromeOptions.addArguments('disable-dev-shm-usage', 'no-sandbox');
}

if (headless) {
  chromeOptions.addArguments(
    '--headless=new',
    '--user-agent=' + headlessUserAgent,
  );
  firefoxOptions
    .addArguments('--headless')
    .setPreference('general.useragent.override', headlessUserAgent);
}

export { headless };

const logPrefs = new logging.Preferences();
logPrefs.setLevel('driver', logging.Level.WARNING);
logPrefs.setLevel('browser', logging.Level.ALL);
//logPrefs.setLevel('performance', logging.Level.INFO);

export const buildDriver = () =>
  new WebDriverBuilder()
    .forBrowser('chrome')
    .setLoggingPrefs(logPrefs)
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .build();
