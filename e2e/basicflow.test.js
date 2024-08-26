import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { Builder, By, until, logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import 'chromedriver';

const HOST = process.env['TARGET_HOST'];

const downloadDir = join(dirname(fileURLToPath(import.meta.url)), 'downloads');
await mkdir(downloadDir, { recursive: true });

const chromeOptions = new Options();
chromeOptions.windowSize({ width: 900, height: 500 });
chromeOptions.setUserPreferences({
  'profile.default_content_settings.popups': 0,
  'download.prompt_for_download': false,
  'download.default_directory': downloadDir,
});
chromeOptions.addArguments('--headless=new');

const logPrefs = new logging.Preferences();
logPrefs.setLevel('driver', logging.Level.WARNING);
logPrefs.setLevel('browser', logging.Level.ALL);
//logPrefs.setLevel('performance', logging.Level.INFO);

const user = `user-${Date.now()}`;

const driver = new Builder()
  .forBrowser('chrome')
  .setLoggingPrefs(logPrefs)
  .setChromeOptions(chromeOptions)
  .build();

const times = [];
try {
  await driver.get(HOST);
  await driver.wait(until.elementLocated(By.css('.page-welcome')), 10000);

  await driver.findElement(By.css('.sso-google')).click();
  await driver.findElement(By.css('form input[name=identifier]')).sendKeys(user);
  await driver.findElement(By.css('form button')).click();

  await driver.wait(until.elementLocated(By.css('.page-retro-create')), 10000);

  await driver.findElement(By.css('form input[name=name]')).sendKeys('My Retro');
  await driver.findElement(By.css('form input[name=slug]')).sendKeys(`retro-${Date.now()}`);
  await driver.findElement(By.css('form input[name=password]')).sendKeys('my-password');
  await driver.findElement(By.css('form input[name=password-confirmation]')).sendKeys('my-password');
  await driver.findElement(By.css('form button')).click();

  await driver.wait(until.elementLocated(By.css('.page-retro')), 10000);

  await driver.findElement(By.css('.happy .text-entry textarea')).sendKeys('yay');
  await driver.findElement(By.css('.happy .text-entry button')).click();
  await driver.findElement(By.xpath(`//button[text()="Create Archive"]`)).click();

  await driver.findElement(By.xpath(`//button[text()="Archive"]`)).click();
  await driver.sleep(300); // wait for popup to close

  await driver.findElement(By.linkText('Archives')).click();
  await driver.wait(until.elementLocated(By.css('.page-archive-list')), 10000);
  await driver.findElement(By.linkText('Export as JSON')).click();
  await driver.sleep(300);
  await driver.findElement(By.css('.archive-link')).click();
  await driver.sleep(300);

  times.push({ id: 'get', tm: Date.now() }); await driver.get(HOST + 'retros');
  times.push({ id: 'wait css', tm: Date.now() }); await driver.wait(until.elementLocated(By.css('.page-retro-list')), 10000);
  times.push({ id: 'click login', tm: Date.now() }); await driver.findElement(By.css('.sso-google')).click();
  times.push({ id: 'sleep', tm: Date.now() }); await driver.sleep(500);
  times.push({ id: 'populate', tm: Date.now() }); await driver.findElement(By.css('form input[name=identifier]')).sendKeys(user);
  times.push({ id: 'click submit', tm: Date.now() }); await driver.findElement(By.css('form button')).click();
  times.push({ id: 'wait target css', tm: Date.now() }); await driver.wait(until.elementLocated(By.css('.page-retro-list')), 10000);

  times.push({ id: '', tm: Date.now() });
  const deltas = [];
  for (let i = 0; i < times.length - 1; ++i) {
    deltas.push({ id: times[i].id, d: times[i + 1].tm - times[i].tm });
  }
  if (deltas.some(({ d }) => d > 4000)) {
    throw new Error(`login timeout\n${deltas.map(({ id, d }) => `${id} = ${d}`).join('\n')}`);
  }
} finally {
  console.log('closing browser page');
  const logs = driver.manage().logs();
  const types = await logs.getAvailableLogTypes();
  const allLogs = [];
  for (const type of types) {
    const entries = await logs.get(type);
    for (const entry of entries) {
      entry.type = type; // logs.get returns blank types
      allLogs.push(entry);
    }
  }
  console.log('logs:\n' + allLogs
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((l) => `${new Date(l.timestamp).toISOString()} ${l.type} ${l.level} ${l.message}`)
    .join('\n'));
  await driver.quit();
}
