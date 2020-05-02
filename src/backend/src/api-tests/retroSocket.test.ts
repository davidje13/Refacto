import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory, { TestHooks } from '../app';

function getRetroToken(
  { retroAuthService }: TestHooks,
  retroId: string,
  scopes = {},
): Promise<string | null> {
  return retroAuthService.grantToken(retroId, {
    read: true,
    readArchives: true,
    write: true,
    ...scopes,
  });
}

describe('API retro websocket', () => {
  let hooks: TestHooks;
  let retroId: string;

  const server = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    hooks = app.testHooks;

    retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await hooks.retroAuthService.setPassword(retroId, 'password');

    return app.createServer();
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial replace-all retro data for known retro IDs', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ change }) => (change[0] === '=' && change[1].name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: ['=', 'bar'] }, id: 7 })
        .expectJson(({ change }) => (change.name[1] === 'bar'))
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ change }) => (change[1].name === 'bar'))
        .close()
        .expectClosed();
    });

    it('rejects invalid changes', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: ['invalid'] }, id: 7 })
        .expectJson((json) => (json.error && json.id === 7))
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ change }) => (change[1].name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('closes the connection for incorrect tokens', async () => {
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send('nope')
        .expectClosed();
    });

    it('closes the connection for unknown IDs', async () => {
      await request(server)
        .ws('/api/retros/nope')
        .send('any-token')
        .expectClosed();
    });
  });
});
