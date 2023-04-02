import request from 'superwstest';
import { testConfig } from './testConfig';
import { testServerRunner } from './testServerRunner';
import { appFactory, type TestHooks } from '../app';

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
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    const hooks = app.testHooks;

    const retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await hooks.retroAuthService.setPassword(retroId, 'password');

    return { run: app, hooks, retroId };
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial retro data for known retro IDs', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ init }) => (init.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

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
        .expectJson(({ init }) => (init.name === 'bar'))
        .close()
        .expectClosed();
    });

    it('rejects invalid changes', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

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
        .expectJson(({ init }) => (init.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('closes the connection for incorrect tokens', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send('nope')
        .expectClosed();
    });

    it('closes the connection for unknown IDs', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .ws('/api/retros/nope')
        .send('any-token')
        .expectClosed();
    });
  });
});
