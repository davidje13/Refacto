import request from 'superwstest';
import jwt from 'jwt-simple';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory, { TestHooks } from '../app';

function getUserToken(
  { userAuthService }: TestHooks,
  userId: string,
): string {
  return userAuthService.grantToken({
    aud: 'user',
    iss: 'test',
    sub: userId,
  });
}

describe('API auth', () => {
  const ownerId = 'my-id';
  let hooks: TestHooks;
  let retroId: string;

  const server = testServerRunner(async () => {
    const app = await appFactory(testConfig({
      password: {
        workFactor: 3,
        secretPepper: 'abc',
      },
    }));

    hooks = app.testHooks;

    retroId = await hooks.retroService.createRetro(ownerId, '', '', '');
    await hooks.retroAuthService.setPassword(retroId, 'password');

    return app.createServer();
  });

  describe('/api/auth/tokens/retro-id/user', () => {
    it('responds with a token for the owner user', async () => {
      const userToken = getUserToken(hooks, ownerId);

      const response = await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('rejects other users', async () => {
      const userToken = getUserToken(hooks, 'not-my-id');

      const response = await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).not.toBeTruthy();
      expect(response.body.error).toEqual('not retro owner');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/auth/tokens/${retroId}/user`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('/api/auth/tokens/retro-id', () => {
    it('responds with a token for the correct password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'password' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('responds HTTP Bad Request for incorrect password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId}`)
        .send({ password: 'nope' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).not.toBeTruthy();
      expect(response.body.error).toEqual('incorrect password');
    });

    it('responds HTTP Bad Request for unknown retro IDs', async () => {
      await request(server)
        .post('/api/auth/tokens/nope')
        .send({ password: 'anything' })
        .expect(400);
    });

    it('returns a signed JWT token with read/write scope', async () => {
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
