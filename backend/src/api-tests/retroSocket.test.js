import request from 'superwstest';
import testConfig from './testConfig';
import appFactory from '../app';

function getRetroToken({ retroAuthService }, retroId) {
  return retroAuthService.grantToken(retroId, {
    read: true,
    readArchives: true,
    write: true,
  });
}

describe('API retro websocket', () => {
  let hooks;
  let retroId;
  let server;

  beforeEach(async () => {
    const app = await appFactory(testConfig());

    hooks = app.testHooks;

    retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await hooks.retroAuthService.setPassword(retroId, 'password');

    server = app.createServer();
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial replace-all retro data for known retro IDs', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ change }) => (change.$set.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: { $set: 'bar' } }, id: 7 })
        .expectJson(({ change }) => (change.name.$set === 'bar'))
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ change }) => (change.$set.name === 'bar'))
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
