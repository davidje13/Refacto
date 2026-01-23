import { decodeJWT } from 'authentication-backend/jwt';
import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { getUserToken, testServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('API auth', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({
        password: {
          workFactor: 3,
          secretPepper: 'abc',
        },
      }),
    );

    const hooks = app.testHooks;

    const ownerId = 'my-id';
    const retroId = await hooks.retroService.createRetro(ownerId, 's', '', '');
    await hooks.retroAuthService.setPassword(retroId, 'password');

    return { run: app, hooks, ownerId, retroId };
  });

  describe('/api/auth/tokens/retro-id/api-key', () => {
    it('responds with a token for a valid API key', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual(['read', 'write']);
      expect(response.body.error).toBeFalsy();
    });

    it('limits scopes if requested', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write', 'readArchives'],
      );
      const apiKey = createdApiKey!.key;

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({
          apiKey,
          scopes: { required: ['read'], optional: ['write', 'nope'] },
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual(['read', 'write']);
      expect(response.body.error).toBeFalsy();
    });

    it('responds HTTP Forbidden if a required scope is unavailable', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey, scopes: { required: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Forbidden if no scopes are available', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey, scopes: { optional: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Bad Request for unknown keys', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey: 'unknown' })
        .expect(400)
        .expect('Content-Type', /application\/json/);
      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('unknown key');
    });

    it('responds HTTP Bad Request for key/retro mismatches', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey: 'unknown' })
        .expect(400)
        .expect('Content-Type', /application\/json/);
      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('unknown key');
    });

    it('responds HTTP Bad Request for unknown retro IDs', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);
      const otherRetroId = await hooks.retroService.createRetro(
        ownerId,
        's2',
        '',
        '',
      );
      await hooks.retroAuthService.setPassword(otherRetroId, 'password');
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        otherRetroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey })
        .expect(400);
      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('unknown key');
    });

    it('returns a signed JWT token with scopes', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      const { retroToken } = response.body;
      const data = decodeJWT(retroToken, {
        verifyKey: false,
        verifyIss: 'retro-key',
        verifyAud: `retro-${retroId}`,
        verifyActive: true,
      });
      expect(data.payload.sub).toEqual(createdApiKey!.id);
      expect(data.payload.scopes).toEqual({
        read: true,
        write: true,
      });

      await request(server)
        .get(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200);
    });

    it('revokes keys and tokens if deleted', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);
      const createdApiKey = await hooks.retroAuthService.createApiKey(
        retroId,
        'test',
        ['read', 'write'],
      );
      const apiKey = createdApiKey!.key;

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      const { retroToken } = response.body;

      await request(server)
        .get(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200);

      await hooks.retroAuthService.deleteApiKey(retroId, createdApiKey!.id);

      // key is invalidated
      await request(server)
        .post(`/api/auth/tokens/${retroId}/api-key`)
        .send({ apiKey })
        .expect(400);

      // existing tokens are invalidated
      await request(server)
        .get(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(401);
    });
  });

  describe('/api/auth/tokens/retro-id/user', () => {
    it('responds with a token for the owner user', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual([
        'read',
        'readArchives',
        'write',
        'manage',
      ]);
      expect(response.body.error).toBeFalsy();
    });

    it('limits scopes if requested', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ scopes: { required: ['read'], optional: ['write', 'nope'] } })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual(['read', 'write']);
      expect(response.body.error).toBeFalsy();
    });

    it('rejects other users', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'not-my-id');

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('not retro owner');
    });

    it('responds HTTP Forbidden if a required scope is unavailable', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ scopes: { required: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Forbidden if no scopes are available', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ scopes: { optional: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .send({})
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', 'Bearer Foo')
        .send({})
        .expect(401);
    });
  });

  describe('/api/auth/tokens/retro-id', () => {
    it('responds with a token for the correct password', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual([
        'read',
        'readArchives',
        'write',
        'manage',
      ]);
      expect(response.body.error).toBeFalsy();
    });

    it('limits scopes if requested', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({
          password: 'password',
          scopes: { required: ['read'], optional: ['write', 'nope'] },
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.scopes).toEqual(['read', 'write']);
      expect(response.body.error).toBeFalsy();
    });

    it('responds HTTP Forbidden if a required scope is unavailable', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password', scopes: { required: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Forbidden if no scopes are available', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password', scopes: { optional: ['nope'] } })
        .expect(403);
    });

    it('responds HTTP Bad Request for incorrect password', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'nope' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('incorrect password');
    });

    it('responds HTTP Bad Request for unknown retro IDs', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .post('/api/auth/tokens/nope')
        .send({ password: 'anything' })
        .expect(400);
    });

    it('returns a signed JWT token with scopes', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password' })
        .expect(200);

      const { retroToken } = response.body;
      const data = decodeJWT(retroToken, {
        verifyKey: false,
        verifyIss: 'retro-password',
        verifyAud: `retro-${retroId}`,
        verifyActive: true,
      });

      expect(data.payload.scopes).toEqual({
        read: true,
        write: true,
        readArchives: true,
        manage: true,
      });

      await request(server)
        .get(`/api/retros/${retroId}/archives`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200);
    });
  });
});

describe('API auth with my retros disabled', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({ permit: { myRetros: false } }),
    );

    const hooks = app.testHooks;

    const ownerId = 'my-id';
    const retroId = await hooks.retroService.createRetro(ownerId, 's', '', '');
    await hooks.retroAuthService.setPassword(retroId, 'password');

    return { run: app, hooks, ownerId, retroId };
  });

  describe('/api/auth/tokens/retro-id/user', () => {
    it('rejects all users', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('must use password');
    });
  });
});
