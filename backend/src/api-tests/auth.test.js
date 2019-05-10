import request from 'superwstest';
import testConfig from './testConfig';
import appFactory from '../app';

describe('API Auth', () => {
  let retroId1;
  let server;

  beforeEach(async () => {
    const app = await appFactory(testConfig({
      password: {
        workFactor: 3,
        secretPepper: 'abc',
      },
    }));

    const {
      retroService,
      retroAuthService,
    } = app.testHooks;

    retroId1 = await retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await retroAuthService.setPassword(retroId1, 'password');

    server = app.createServer();
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  describe('/api/auth/tokens/retro-id', () => {
    it('responds with a token for the correct password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId1}`)
        .send({ password: 'password' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('responds HTTP Bad Request for incorrect password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${retroId1}`)
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
  });
});
