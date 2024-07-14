import { By, until, WebDriver, WebElementCondition } from 'selenium-webdriver';
import { type Entry } from 'selenium-webdriver/lib/logging';
import { untilNoElementLocated } from '../../helpers/customUntil';
import { PageFragment } from './PageFragment';
import { Popup } from './Popup';

const HOST = process.env['TARGET_HOST'] ?? '';
if (!HOST) {
  throw new Error('Must configure TARGET_HOST');
}

const untilNoLoaders = untilNoElementLocated(By.css('.loader'));

async function getDocumentHtml(driver: WebDriver) {
  try {
    return await driver.executeScript<string>('return document.body.outerHTML');
  } catch (e) {
    return 'Failed to get HTML of document';
  }
}

async function getLogs(driver: WebDriver) {
  try {
    const logs = driver.manage().logs();
    const types = await logs.getAvailableLogTypes();
    const allLogs: Entry[] = [];
    for (const type of types) {
      const entries = await logs.get(type);
      for (const entry of entries) {
        entry.type = type; // logs.get returns blank types
        allLogs.push(entry);
      }
    }
    return allLogs
      .filter((l) => !isSpuriousLog(l))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(formatLog)
      .join('\n');
  } catch (e) {
    return 'Failed to get browser logs';
  }
}

const isSpuriousLog = (l: Entry) =>
  l.type === 'browser' &&
  l.message.includes('the server responded with a status of 404');

const formatLog = (l: Entry) =>
  `${new Date(l.timestamp).toISOString()} ${l.type} ${l.level} ${JSON.stringify(l.message)}`;

export abstract class Page extends PageFragment {
  private readonly untilNavigated: WebElementCondition;

  protected constructor(
    driver: WebDriver,
    private readonly subpath: string,
    expectedCSS: string,
  ) {
    super(driver, By.css('body'));
    this.untilNavigated = until.elementLocated(By.css(expectedCSS));
  }

  public async load() {
    await this.navigate();
    await this.wait();
    return this;
  }

  public async wait() {
    try {
      await this.driver.wait(
        this.untilNavigated,
        this.explicitWaitTimeout,
        `Failed to load page '${this.constructor.name}'`,
      );
      await this.driver.wait(
        untilNoLoaders,
        this.explicitWaitTimeout,
        `Loading indicator for page '${this.constructor.name}' did not disappear`,
      );
    } catch (e) {
      if (e instanceof Error) {
        const content = await getDocumentHtml(this.driver);
        const logs = await getLogs(this.driver);
        e.message = `${e.message}\n\nPage content:\n\n${content}\n\nLogs:\n\n${logs}`;
      }
      throw e;
    }
    // wait an additional frame to allow some async events (e.g. title changes)
    await this.driver.sleep(100);
    return this;
  }

  public getTitle() {
    return this.driver.getTitle();
  }

  protected async navigate() {
    const path = new URL(this.subpath, HOST).toString();
    process.stdout.write(`Navigating to ${path}\n`);
    await this.driver.get(path);
  }

  protected getPopup(className: string) {
    return new Popup(this.driver, className);
  }

  protected async sendKeys(...keys: Array<string | Promise<string>>) {
    await this.driver
      .actions({ async: false, bridge: false })
      .sendKeys(...keys)
      .perform();
  }
}
