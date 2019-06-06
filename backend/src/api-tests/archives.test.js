import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory from '../app';

function getRetroToken({ retroAuthService }, retroId, permissions = {}) {
  return retroAuthService.grantToken(retroId, Object.assign({
    read: true,
    readArchives: true,
    write: true,
  }, permissions));
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

  describe('/api/retros/retro-id/archives', () => {
    it('lists all retro archives in JSON format', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.archives.length).toEqual(1);
      expect(response.body.archives[0].id).toEqual(archiveId);
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "readArchives"', async () => {
      const retroToken = await getRetroToken(hooks, retroId, {
        readArchives: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
  });

  describe('POST /api/retros/retro-id/archives', () => {
    it('creates a new archive', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .send({ format: 'foo', items: [{ id: 'foo' }] })
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const returnedId = response.body.id;
      const storedArchive = await hooks.retroArchiveService
        .getRetroArchive(retroId, returnedId);

      expect(storedArchive.data.format).toEqual('foo');
    });

    it('rejects empty archives', async () => {
      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .send({ format: 'foo', items: [] })
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(400);
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "write"', async () => {
      const retroToken = await getRetroToken(hooks, retroId, { write: false });
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
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

    it('responds HTTP Forbidden if scope is not "readArchives"', async () => {
      const retroToken = await getRetroToken(hooks, retroId, {
        readArchives: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}/archives/${archiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
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
