import buildDriver from './helpers/selenium';
import Welcome from './pages/Welcome';

describe('Running a retro', () => {
  let driver;

  let welcome;
  let retros;
  let password;
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

  it('shows retro password entry when retro chosen', async () => {
    password = await retros.clickRetroAtIndex(0);

    expect(await password.getTitle()).toEqual('my-retro - Refacto');
    await password.setPassword('password');
  });

  it('shows retro data when correct password given', async () => {
    retro = await password.submit();

    expect(await retro.getTitle()).toEqual('My Retro - Refacto');
    expect(await retro.getNameText()).toEqual('My Retro');
  });
});
