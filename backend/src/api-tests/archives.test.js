import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory from '../app';

function getRetroToken({ retroAuthService }, retroId) {
  return retroAuthService.grantToken(retroId, {
    read: true,
    readArchives: true,
    write: true,
  });
}

describe('API retro archives', () => {
  let hooks;
  let retroId;
  let archiveId;

  const server = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    hooks = app.testHooks;

    retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    archiveId = await hooks.retroArchiveService.createArchive(retroId, {
      format: 'mood',
      items: [{ id: 'z9' }],
    });

    await hooks.retroAuthService.setPassword(retroId, 'password');

    return app.createServer();
  });

  describe('/api/retros/retro-id/archives/archive-id', () => {
    it('responds with retro archives in JSON format', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .get(`/api/retros/${retroId}/archives/${archiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.data.items[0].id).toEqual('z9');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${retroId}/archives/nope`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${retroId}/archives/nope`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async () => {
      const otherRetroId = await hooks.retroService.createRetro();

      const otherArchiveId = await hooks.retroArchiveService
        .createArchive(otherRetroId, { format: 'mood' });

      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .get(`/api/retros/${retroId}/archives/${otherArchiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);
    });
  });
});
