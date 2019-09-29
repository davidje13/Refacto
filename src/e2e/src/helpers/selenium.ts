import webdriver, { WebDriver } from 'selenium-webdriver';
import { Command } from 'selenium-webdriver/lib/command';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { downloadDir } from './downloads';

// Set SELENIUM_BROWSER environment variable to switch browser

const headless = process.env.HEADLESS !== 'false';

const width = 900; // ensure non-mobile display
const height = 500;

// firefoxOptions is cast to `any` as a workaround for
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/28464

const chromeOptions = new chrome.Options()
  .windowSize({ width, height })
  .setUserPreferences({
    'profile.default_content_settings.popups': 0,
    'download.prompt_for_download': false,
    'download.default_directory': downloadDir,
  });

const firefoxOptions = (new firefox.Options() as any)
  .windowSize({ width, height });

if (headless) {
  chromeOptions.headless();
  firefoxOptions.headless();
}

export async function supportsDownload(driver: WebDriver): Promise<boolean> {
  const caps = await driver.getCapabilities();
  const browser = caps.get('browserName');
  if (browser === 'chrome') {
    if (headless) {
      // work around https://bugs.chromium.org/p/chromium/issues/detail?id=696481
      // thanks, https://stackoverflow.com/a/51639051/1180785
      const session = await driver.getSession();
      driver.getExecutor().defineCommand(
        'send_command',
        'POST',
        `/session/${session.getId()}/chromium/send_command`,
      );
      const cmd = new Command('send_command').setParameters({
        cmd: 'Page.setDownloadBehavior',
        params: {
          behavior: 'allow',
          downloadPath: downloadDir,
        },
      });
      await driver.execute(cmd);
    }
    return true;
  }
  return false;
}

export default function buildDriver(): WebDriver {
  return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .build();
}
