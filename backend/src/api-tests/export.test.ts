import request from 'superwstest';
import { makeRetroItem } from '../shared/api-entities';
import { TestLogger } from './TestLogger';
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

describe('API retros', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;

    const retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await hooks.retroArchiveService.createArchive(retroId, {
      format: 'mood',
      options: {},
      items: [makeRetroItem({ created: 1568400000000, id: 'z9' })],
    });

    await hooks.retroAuthService.setPassword(retroId, 'password');

    return { run: app, hooks, retroId };
  });

  describe('/api/retros/retro-id/export/json', () => {
    it('returns the retro and its archives in a human-friendly JSON format', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);

      const response = await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Disposition', /attachment/)
        .expect('Content-Type', /application\/json/);

      expect(response.body.url).toEqual('my-retro');
      expect(response.body.name).toEqual('My Retro');
      expect(response.body.archives[0].snapshot.items[0].created).toEqual(
        '2019-09-13T18:40:00.000Z',
      );
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });

    it('responds HTTP Forbidden if user permissions are insufficient', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken1 = await getRetroToken(hooks, retroId, { read: false });

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', `Bearer ${retroToken1}`)
        .expect(403);

      const retroToken2 = await getRetroToken(hooks, retroId, {
        readArchives: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', `Bearer ${retroToken2}`)
        .expect(403);
    });
  });
});
