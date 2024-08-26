import { type WebDriver } from 'selenium-webdriver';
import { type Entry } from 'selenium-webdriver/lib/logging';

export async function getDocumentHtml(driver: WebDriver) {
  try {
    return await driver.executeScript<string>('return document.body.outerHTML');
  } catch (e) {
    return `Failed to get HTML of document: ${e}`;
  }
}

export async function getLogs(driver: WebDriver) {
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
    // Known issue: FireFox does not support getAvailableLogTypes. See https://github.com/mozilla/geckodriver/issues/284#issuecomment-963108711
    return `Failed to get browser logs: ${e}`;
  }
}

const isSpuriousLog = (l: Entry) =>
  l.type === 'browser' &&
  l.message.includes('the server responded with a status of 404');

const formatLog = (l: Entry) =>
  `${new Date(l.timestamp).toISOString()} ${l.type} ${l.level} ${l.message}`;
