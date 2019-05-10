import request from 'superwstest';
import testConfig from './testConfig';
import appFactory from '../app';

describe('API retro archives', () => {
  let hooks;
  let retroId1;
  let archiveId1
  let server;

  beforeEach(async () => {
    const app = await appFactory(testConfig());

    hooks = app.testHooks;

    retroId1 = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    archiveId1 = await hooks.retroArchiveService.createArchive(retroId1, {
      format: 'mood',
      items: [{ id: 'z9' }],
    });

    await hooks.retroAuthService.setPassword(retroId1, 'password');

    server = app.createServer();
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  function getRetroToken(retroId) {
    return hooks.retroAuthService.grantToken(retroId, {
      read: true,
      readArchives: true,
      write: true,
    });
  }

  describe('/api/retros/retro-id/archives/archive-id', () => {
    it('responds with retro archives in JSON format', async () => {
      const retroToken = await getRetroToken(retroId1);
      const response = await request(server)
        .get(`/api/retros/${retroId1}/archives/${archiveId1}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.data.items[0].id).toEqual('z9');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${retroId1}/archives/nope`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${retroId1}/archives/nope`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async () => {
      const otherRetroId = await hooks.retroService
        .createRetro('me', 'my-second-retro', 'My Second Retro', 'mood');

      const otherArchiveId = await hooks.retroArchiveService
        .createArchive(otherRetroId, { format: 'mood' });

      const retroToken = await getRetroToken(retroId1);
      await request(server)
        .get(`/api/retros/${retroId1}/archives/${otherArchiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);
    });
  });
});
