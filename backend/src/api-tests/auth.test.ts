import request from 'superwstest';
import jwt from 'jwt-simple';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { testServerRunner } from './testServerRunner';
import { appFactory, type TestHooks } from '../app';

function getUserToken({ userAuthService }: TestHooks, userId: string): string {
  return userAuthService.grantToken({
    aud: 'user',
    iss: 'test',
    sub: userId,
  });
}

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

  describe('/api/auth/tokens/retro-id/user', () => {
    it('responds with a token for the owner user', async (props) => {
      const { server, hooks, ownerId, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, ownerId);

      const response = await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.error).toBeFalsy();
    });

    it('rejects other users', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'not-my-id');

      const response = await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('not retro owner');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).get(`/api/auth/tokens/${retroId}/user`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', 'Bearer Foo')
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
      expect(response.body.error).toBeFalsy();
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

    it('returns a signed JWT token with read/write scope', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password' })
        .expect(200);

      const { retroToken } = response.body;
      const data = jwt.decode(retroToken, '', true);

      expect(data.aud).toEqual(`retro-${retroId}`);
      expect(data.scopes).toEqual({
        read: true,
        write: true,
        readArchives: true,
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
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeFalsy();
      expect(response.body.error).toEqual('must use password');
    });
  });
});
