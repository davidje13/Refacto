import request from 'superwstest';
import { makeRetroItem } from '../shared/api-entities';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import {
  createRetro,
  getRetroToken,
  testServerRunner,
} from './testServerRunner';
import { appFactory } from '../app';

describe('API retros', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;

    const { retroId, retroToken } = await createRetro(hooks, {
      slug: 'my-retro',
      name: 'My Retro',
    });

    await hooks.retroArchiveService.createArchive(retroId, {
      format: 'mood',
      options: {},
      items: [
        makeRetroItem({
          created: 1568400000000,
          id: 'z9',
          category: 'foo',
          message: 'My item',
        }),
      ],
    });

    return { run: app, hooks, retroId, retroToken };
  });

  describe('/api/retros/retro-id/export', () => {
    it('returns the retro and its archives in a API-friendly JSON format', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      const response = await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Disposition', /attachment/)
        .expect('Content-Type', /application\/json/);

      expect(response.body.url).toEqual('my-retro');
      expect(response.body.name).toEqual('My Retro');
      expect(response.body.archives).hasLength(1);
      expect(response.body.archives[0].snapshot.items[0].created).toEqual(
        '2019-09-13T18:40:00.000Z',
      );
    });

    it('returns the retro and its archives in a spreadsheet-friendly CSV format', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      const response = await request(server)
        .get(`/api/retros/${retroId}/export/csv`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200);

      // A strange bug in supertest caused by `content-type: ...; headers=present`
      // means we must check headers separately here
      // See https://github.com/forwardemail/supertest/issues/876
      expect(response.headers['content-disposition']).matches(/attachment/);
      expect(response.headers['content-type']).matches(/text\/csv/);

      expect(response.text).matches(
        /Archive,Category,Message,Votes,State\n"#1 \([\d\-]+\)",foo,"My item",0,\n/,
      );
    });

    it('returns HTTP Not Found if the format is unknown', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      const response = await request(server)
        .get(`/api/retros/${retroId}/export/nope`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);

      expect(response.body.error).toEqual('Unknown format');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .expect(401);

      await request(server)
        .get(`/api/retros/${retroId}/export/csv`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);

      await request(server)
        .get(`/api/retros/${retroId}/export/csv`)
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

      await request(server)
        .get(`/api/retros/${retroId}/export/csv`)
        .set('Authorization', `Bearer ${retroToken1}`)
        .expect(403);

      const retroToken2 = await getRetroToken(hooks, retroId, {
        readArchives: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}/export/json`)
        .set('Authorization', `Bearer ${retroToken2}`)
        .expect(403);

      await request(server)
        .get(`/api/retros/${retroId}/export/csv`)
        .set('Authorization', `Bearer ${retroToken2}`)
        .expect(403);
    });
  });
});
