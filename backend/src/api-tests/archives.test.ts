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

describe('API retro archives', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;

    const retroId = await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    const archiveId = await hooks.retroArchiveService.createArchive(retroId, {
      format: 'mood',
      options: {},
      items: [makeRetroItem({ id: 'z9' })],
    });

    await hooks.retroAuthService.setPassword(retroId, 'password');

    return { run: app, hooks, retroId, archiveId };
  });

  describe('/api/retros/retro-id/archives', () => {
    it('lists all retro archives in JSON format', async (props) => {
      const { server, hooks, retroId, archiveId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.archives.length).toEqual(1);
      expect(response.body.archives[0].id).toEqual(archiveId);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).get(`/api/retros/${retroId}/archives`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "readArchives"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

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
    it('creates a new archive', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .send({
          format: 'foo',
          options: { opt: 'yes' },
          items: [makeRetroItem({ id: 'foo' })],
        })
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const returnedId = response.body.id;
      const storedArchive = await hooks.retroArchiveService.getRetroArchive(
        retroId,
        returnedId,
      );

      expect(storedArchive?.format).toEqual('foo');
      expect(storedArchive?.options['opt']).toEqual('yes');
    });

    it('rejects empty archives', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .send({ format: 'foo', options: {}, items: [] })
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(400);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).post(`/api/retros/${retroId}/archives`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "write"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, { write: false });
      await request(server)
        .post(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
  });

  describe('/api/retros/retro-id/archives/archive-id', () => {
    it('responds with retro archives in JSON format', async (props) => {
      const { server, hooks, retroId, archiveId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId);
      const response = await request(server)
        .get(`/api/retros/${retroId}/archives/${archiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.items[0].id).toEqual('z9');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/archives/nope`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/archives/nope`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "readArchives"', async (props) => {
      const { server, hooks, retroId, archiveId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, {
        readArchives: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}/archives/${archiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const otherRetroId = await hooks.retroService.createRetro(
        '',
        's',
        '',
        '',
      );

      const otherArchiveId = await hooks.retroArchiveService.createArchive(
        otherRetroId,
        { format: 'mood', options: {}, items: [] },
      );

      const retroToken = await getRetroToken(hooks, retroId);
      await request(server)
        .get(`/api/retros/${retroId}/archives/${otherArchiveId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);
    });
  });
});
