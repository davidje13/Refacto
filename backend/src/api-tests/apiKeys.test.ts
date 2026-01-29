import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import {
  createRetro,
  getRetroToken,
  testServerRunner,
} from './testServerRunner';
import { appFactory } from '../app';

describe('API keys', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;
    const { retroId, retroToken } = await createRetro(hooks);

    const apiKey = await hooks.retroAuthService.createApiKey(
      retroId,
      'my-key',
      ['read'],
    );

    return { run: app, hooks, retroId, retroToken, apiKey: apiKey! };
  });

  describe('/api/retros/retro-id/api-keys', () => {
    it('lists all API keys', async (props) => {
      const { server, retroId, retroToken, apiKey } = props.getTyped(PROPS);

      const response = await request(server)
        .get(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.apiKeys.length).toEqual(1);
      expect(response.body.apiKeys[0].id).toEqual(apiKey.id);
      expect(response.body.apiKeys[0].name).toEqual('my-key');
      expect(response.body.apiKeys[0].lastUsed).toEqual(0);
      expect(response.body.apiKeys[0].scopes).toEqual(['read']);
    });

    it('does not include API keys for other retros', async (props) => {
      const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

      const other = await createRetro(hooks);
      await hooks.retroAuthService.createApiKey(other.retroId, 'my-other-key', [
        'read',
      ]);

      const response = await request(server)
        .get(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.apiKeys.length).toEqual(1);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).get(`/api/retros/${retroId}/api-keys`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "manage"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, { manage: false });

      await request(server)
        .get(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
  });

  describe('POST /api/retros/retro-id/api-keys', () => {
    it('creates a new API key', async (props) => {
      const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/retros/${retroId}/api-keys`)
        .send({ name: 'new key', scopes: ['write'] })
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const grant = await hooks.retroAuthService.grantForApiKey(
        retroId,
        response.body.key,
      );

      expect(grant?.token).toBeTruthy();
      expect(grant?.scopes).toEqual(new Set(['write']));
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).post(`/api/retros/${retroId}/api-keys`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "manage"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, { manage: false });
      await request(server)
        .post(`/api/retros/${retroId}/api-keys`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
  });

  describe('/api/retros/retro-id/api-keys/api-key-id', () => {
    it('deletes the key', async (props) => {
      const { server, hooks, retroId, retroToken, apiKey } =
        props.getTyped(PROPS);

      await request(server)
        .delete(`/api/retros/${retroId}/api-keys/${apiKey.id}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const grant = await hooks.retroAuthService.grantForApiKey(
        retroId,
        apiKey.key,
      );
      expect(grant).toBeNull();
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId, apiKey } = props.getTyped(PROPS);

      await request(server)
        .delete(`/api/retros/${retroId}/api-keys/${apiKey.id}`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId, apiKey } = props.getTyped(PROPS);

      await request(server)
        .delete(`/api/retros/${retroId}/api-keys/${apiKey.id}`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "manage"', async (props) => {
      const { server, hooks, retroId, apiKey } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, { manage: false });

      await request(server)
        .delete(`/api/retros/${retroId}/api-keys/${apiKey.id}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });

    it('responds HTTP Not Found for mismatched retro/key IDs', async (props) => {
      const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

      const other = await createRetro(hooks);
      const otherApiKey = await hooks.retroAuthService.createApiKey(
        other.retroId,
        'my-other-key',
        ['read'],
      );

      await request(server)
        .delete(`/api/retros/${retroId}/api-keys/${otherApiKey}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);
    });
  });
});
