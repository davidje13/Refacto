import buildDriver from './helpers/selenium';
import Welcome from './pages/Welcome';
import Password from './pages/Password';

describe('Running a retro', () => {
  let driver;
  let driver2;

  let userName;
  let retroSlug;
  let retroPassword;

  let welcome;
  let login;
  let create;
  let retro;

  beforeAll(async () => {
    driver = buildDriver();
    driver2 = buildDriver();
    jest.setTimeout(30000);

    userName = `e2e-test-user-${Date.now()}`;
    retroSlug = `e2e-test-retro-${Date.now()}`;
    retroPassword = 'my-password';
  });

  afterAll(async () => {
    await Promise.all([driver.quit(), driver2.quit()]);
  });

  // Tests run sequentially in a single (pair of) browser sessions

  it('loads the welcome page', async () => {
    welcome = await new Welcome(driver).load();

    expect(await welcome.getTitle()).toEqual('Refacto');
    expect(await welcome.getHeaderText()).toContain('Refacto');
  });

  it('triggers a login flow when requested', async () => {
    login = await welcome.clickLoginWithGoogle();
    await login.setIdentifier(userName);
  });

  it('shows a retro creation screen after logging in', async () => {
    create = await login.submit();

    expect(await create.getTitle()).toEqual('New Retro - Refacto');
    await create.setName('My Retro');
    await create.setSlug(retroSlug);
    await create.setPassword(retroPassword);
    await create.setPasswordConfirmation(retroPassword);
  });

  it('redirects to the newly created retro', async () => {
    retro = await create.submit();

    expect(await retro.getTitle()).toEqual('My Retro - Refacto');
    expect(await retro.getNameText()).toEqual('My Retro');
  });

  describe('second user journey', () => {
    let retro2;

    it('prompts for a password for the retro', async () => {
      const password2 = await new Password(driver2, retroSlug).load();

      await password2.setPassword(retroPassword);
      retro2 = await password2.submit();

      expect(await retro2.getTitle()).toEqual('My Retro - Refacto');
    });

    it('synchronises activity (A -> B) in real time', async () => {
      await retro2.expectChange(async () => {
        await retro.setActionItemText('some action');
        await retro.submitActionItem();
      });

      const expectedActions1 = [
        'some action',
      ];
      expect(await retro.getActionItemLabels()).toEqual(expectedActions1);
      expect(await retro2.getActionItemLabels()).toEqual(expectedActions1);
    });

    it('synchronises activity (B -> A) in real time', async () => {
      await retro.expectChange(async () => {
        await retro2.setActionItemText('another action');
        await retro2.submitActionItem();
      });

      const expectedActions2 = [
        'another action',
        'some action',
      ];
      expect(await retro.getActionItemLabels()).toEqual(expectedActions2);
      expect(await retro2.getActionItemLabels()).toEqual(expectedActions2);
    });
  });
});
