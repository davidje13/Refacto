import type { WebDriver } from 'selenium-webdriver';
import jasmineFailFast from './helpers/jasmineFailFast';
import buildDriver, { supportsDownload } from './helpers/selenium';
import Welcome from './pages/Welcome';
import Password from './pages/Password';
import type RetroCreate from './pages/RetroCreate';
import RetroList from './pages/RetroList';
import type Retro from './pages/Retro';
import type RetroArchiveList from './pages/RetroArchiveList';
import type RetroArchive from './pages/RetroArchive';

const uniqueID = `${process.env.SELENIUM_BROWSER}-${Date.now()}`;

jasmineFailFast(); // https://github.com/facebook/jest/issues/2867

describe('Refacto', () => {
  let driver: WebDriver;
  let driver2: WebDriver;

  let userName: string;
  let retroSlug: string;
  let retroPassword: string;

  let welcome: Welcome;
  let create: RetroCreate;
  let retro: Retro;

  beforeAll(async () => {
    driver = buildDriver();
    driver2 = buildDriver();
    jest.setTimeout(Number(process.env.TEST_TIMEOUT || '10000'));

    userName = `e2e-test-user-${uniqueID}`;
    retroSlug = `e2e-test-retro-${uniqueID}`;
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
    const ssoLogin = await welcome.clickLoginWithGoogle();
    await ssoLogin.setIdentifier(userName);
    create = await ssoLogin.submit();
  });

  it('returns to a retro creation screen', async () => {
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

  it('lists created items', async () => {
    await retro.getHappyItemEntry().enter('yay');
    await retro.getHappyItemEntry().enter('hurrah');

    expect(await retro.getMoodItemLabels()).toEqual(['hurrah', 'yay']);
  });

  describe('second user journey', () => {
    let password2: Password;
    let retro2: Retro;

    it('prompts for a password for the retro', async () => {
      password2 = await new Password(driver2, retroSlug).load();
    });

    it('loads the retro when the correct password is entered', async () => {
      await password2.setPassword(retroPassword);
      retro2 = await password2.submit();

      expect(await retro2.getTitle()).toEqual('My Retro - Refacto');
    });

    it('displays previously added items', async () => {
      expect(await retro2.getMoodItemLabels()).toEqual(['hurrah', 'yay']);
    });

    it('synchronises activity (A -> B) in real time', async () => {
      await retro2.expectChange(
        () => retro.getActionItemEntry().enter('some action'),
      );

      const expectedActions1 = [
        'some action',
      ];
      expect(await retro.getActionItemLabels()).toEqual(expectedActions1);
      expect(await retro2.getActionItemLabels()).toEqual(expectedActions1);
    });

    it('synchronises activity (B -> A) in real time', async () => {
      await retro.expectChange(
        () => retro2.getActionItemEntry().enter('another action'),
      );

      const expectedActions2 = [
        'another action',
        'some action',
      ];
      expect(await retro.getActionItemLabels()).toEqual(expectedActions2);
      expect(await retro2.getActionItemLabels()).toEqual(expectedActions2);
    });

    it('synchronises configuration changes', async () => {
      await retro2.expectChange(async () => {
        const settings = await retro.clickSettings();
        await settings.setName('My Retro Renamed');
        await settings.setSlug(`${retroSlug}-renamed`);
        retro = await settings.clickSave();
      });

      expect(await retro.getNameText()).toEqual('My Retro Renamed');
      expect(await retro2.getNameText()).toEqual('My Retro Renamed');
    });

    it('switches URL automatically when slug changes', async () => {
      const newSlug = `${retroSlug}-renamed`;
      expect(await driver.getCurrentUrl()).toContain(newSlug);
      expect(await driver2.getCurrentUrl()).toContain(newSlug);
    });

    it('maintains connectivity after changing URL', async () => {
      await retro.expectChange(() => retro2.focusMoodItem(0));
      await retro.expectChange(() => retro2.closeMoodItem(0));
    });

    it('prompts to archive when the last item is completed', async () => {
      expect(await retro2.getArchivePopup().exists()).toBeFalsy();

      await retro.expectChange(() => retro2.focusMoodItem(1));
      await retro.expectChange(() => retro2.closeMoodItem(1));
      expect(await retro2.getArchivePopup().exists()).toBeTruthy();

      // ...but does not prompt other viewers
      expect(await retro.getArchivePopup().exists()).toBeFalsy();
    });
  });

  describe('archiving', () => {
    let archiveList: RetroArchiveList;
    let archive: RetroArchive;

    it('clears items and completed action items when archiving', async () => {
      await retro.toggleActionItemDone(1);
      await retro.performArchive();

      expect(await retro.getMoodItemLabels()).toEqual([]);
      expect(await retro.getActionItemLabels()).toEqual(['another action']);
    });

    it('displays a list of archives', async () => {
      archiveList = await retro.clickViewArchives();

      const labels = await archiveList.getArchiveLabels();
      expect(labels.length).toEqual(1);
    });

    it('downloads the retro in JSON format', async () => {
      if (!await supportsDownload(driver)) {
        return; // skip download test
      }

      const content = await archiveList.clickExportJson();

      expect(content).toContain('"My Retro Renamed"');
    });

    it('displays archives in a read-only view', async () => {
      archive = await archiveList.clickArchiveAtIndex(0);

      expect(await archive.getTitle()).toContain('My Retro');
      expect(await archive.getNameText()).toContain('My Retro');
      expect(await archive.getActionItemLabels()).toEqual([
        'another action',
        'some action',
      ]);
    });

    it('offers a path back to the retro', async () => {
      archiveList = await archive.clickBack();
      retro = await archiveList.clickBack();

      expect(await retro.getNameText()).toContain('My Retro');
    });
  });

  describe('retro list', () => {
    const retroName = 'My Retro Renamed';
    let retroList: RetroList;

    it('prompts to log in when loaded', async () => {
      retroList = await new RetroList(driver).load();
      retroList = await retroList.loginAs(userName);
    });

    it('displays retros created by the current user', async () => {
      expect(await retroList.getRetroNames()).toEqual([retroName]);
    });

    it('loads linked retros without needing a password', async () => {
      retro = await retroList.clickRetroNamed(retroName);
      expect(await retro.getActionItemLabels()).toEqual(['another action']);
    });

    it('does not list retros from other users', async () => {
      retroList = await new RetroList(driver).load();
      retroList = await retroList.loginAs('nobody');

      expect(await retroList.getRetroNames()).toEqual([]);
    });
  });

  describe('security page', () => {
    it('is accessible from the home page', async () => {
      welcome = await new Welcome(driver).load();
      const security = await welcome.clickSecurity();

      expect(await security.getTitle()).toEqual('Privacy & Security - Refacto');
      expect(await security.getHeaderText()).toContain('Privacy & Security');
    });
  });
});
