import request from 'superwstest';
import jwt from 'jwt-simple';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory from '../app';

describe('API auth', () => {
  let retroId;

  const server = testServerRunner(async () => {
    const app = await appFactory(testConfig({
      password: {
        workFactor: 3,
        secretPepper: 'abc',
      },
    }));

    retroId = await app.testHooks.retroService.createRetro();
    await app.testHooks.retroAuthService.setPassword(retroId, 'password');

    return app.createServer();
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
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const { retroToken } = response.body;

      expect(jwt.decode(retroToken, '', true)).toEqual({
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
