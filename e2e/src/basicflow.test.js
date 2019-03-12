import buildDriver from './helpers/selenium';
import Welcome from './pages/Welcome';

describe('Running a retro', () => {
  let driver;

  let welcome;
  let retros;
  let retro;

  beforeAll(async () => {
    driver = buildDriver();
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    await driver.quit();
  });

  // Tests run sequentially in a single browser session

  it('loads the welcome page', async () => {
    welcome = await new Welcome(driver).load();

    expect(await welcome.getTitle()).toEqual('Refacto');
    expect(await welcome.getHeaderText()).toContain('Refacto');
  });

  it('shows a list of retros when requested', async () => {
    retros = await welcome.clickRetroList();

    expect(await retros.getTitle()).toEqual('Retros - Refacto');
  });

  it('shows a specific retro when clicked', async () => {
    retro = await retros.clickRetroAtIndex(0);

    expect(await retro.getTitle()).toEqual('My Retro - Refacto');
    expect(await retro.getNameText()).toEqual('My Retro');
  });
});
