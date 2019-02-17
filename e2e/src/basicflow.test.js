import { buildDriver, HOST } from './testutils';

describe('Basic flow', () => {
  let driver;

  beforeAll(async () => {
    driver = buildDriver();
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('loads a page running react', async () => {
    await driver.get(HOST);

    const title = await driver.getTitle();
    expect(title).toEqual('Refacto');

    const header = await driver.findElement(By.css('h1')).getText();
    expect(header).toEqual('Ready!');
  });
});
