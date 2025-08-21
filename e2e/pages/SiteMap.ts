import type { WebDriver } from 'selenium-webdriver';
import { getDocumentHtml, getLogs } from '../helpers/debug';
import { Welcome } from './Welcome';
import { Password } from './Password';

export class SiteMap {
  public constructor(public readonly driver: WebDriver) {}

  public navigateToWelcome() {
    return new Welcome(this.driver).load();
  }

  public navigateToRetroPassword(slug: string) {
    return new Password(this.driver, slug).load();
  }

  public async close() {
    const [url, content, logs] = await Promise.all([
      this.driver.getCurrentUrl(),
      getDocumentHtml(this.driver),
      getLogs(this.driver),
    ]);
    console.log('closing browser page');
    console.log('current url', url);
    console.log('page content', content);
    console.log('logs', logs);
    await this.driver.quit();
  }
}
