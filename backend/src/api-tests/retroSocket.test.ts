import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { createRetro, testServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('API retro websocket', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;

    const { retroId, retroToken } = await createRetro(hooks, {
      name: 'My Retro',
    });

    return { run: app, hooks, retroId, retroToken };
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial retro data for known retro IDs', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ init }) => init.name === 'My Retro')
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: ['=', 'bar'] }, id: 7 })
        .expectJson(({ change }) => change.name[1] === 'bar')
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ init }) => init.name === 'bar')
        .close()
        .expectClosed();
    });

    it('rejects invalid changes', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: ['invalid'] }, id: 7 })
        .expectJson((json) => json.error && json.id === 7)
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${retroId}`)
        .send(retroToken)
        .expectJson(({ init }) => init.name === 'My Retro')
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
