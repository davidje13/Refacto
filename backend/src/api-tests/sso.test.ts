import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import jwt from 'jwt-simple';
import testConfig from './testConfig';
import testServerRunner, { addressToString } from './testServerRunner';
import appFactory from '../app';

describe('API single-sign-on', () => {
  const mockSsoServer = testServerRunner(() => {
    const ssoApp = new WebSocketExpress();
    ssoApp.use(WebSocketExpress.urlencoded({ extended: false }));
    ssoApp.get('/', (req, res) => {
      switch (req.query.id_token) {
        case 'my-successful-external-token':
          res.json({ aud: 'my-client-id', sub: 'my-external-id' });
          return;
        case 'my-bad-external-token':
          res.json({ error: 'nope' });
          return;
        case 'my-other-external-token':
          res.json({ aud: 'another-client-id', sub: 'my-external-id' });
          return;
        default:
          res.status(500).end();
      }
    });
    return ssoApp.createServer();
  });

  const server = testServerRunner(() => appFactory(testConfig({
    sso: {
      google: {
        clientId: 'my-client-id',
        authUrl: 'foo',
        tokenInfoUrl: addressToString(mockSsoServer.address()!),
      },
    },
  })));

  describe('/api/sso/service', () => {
    it('responds HTTP Not Found for unsupported services', async () => {
      await request(server)
        .post('/api/sso/nope')
        .expect(404);
    });
  });

  describe('/api/sso/google', () => {
    it('responds with a token for valid external tokens', async () => {
      const response = await request(server)
        .post('/api/sso/google')
        .send({ externalToken: 'my-successful-external-token' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.userToken).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('responds HTTP Bad Request for missing external token', async () => {
      const response = await request(server)
        .post('/api/sso/google')
        .send({})
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.userToken).not.toBeTruthy();
      expect(response.body.error).toEqual('no externalToken provided');
    });

    it('responds HTTP Bad Request for rejected external tokens', async () => {
      const response = await request(server)
        .post('/api/sso/google')
        .send({ externalToken: 'my-bad-external-token' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.userToken).not.toBeTruthy();
      expect(response.body.error).toEqual('validation error nope');
    });

    it('responds HTTP Bad Request for audience mismatch', async () => {
      const response = await request(server)
        .post('/api/sso/google')
        .send({ externalToken: 'my-other-external-token' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.userToken).not.toBeTruthy();
      expect(response.body.error).toEqual('audience mismatch');
    });

    it('responds HTTP Internal Server Error if service fails', async () => {
      await request(server)
        .post('/api/sso/google')
        .send({ externalToken: 'derp' })
        .expect(500);
    });

    it('returns a signed JWT token with the user ID', async () => {
      const response = await request(server)
        .post('/api/sso/google')
        .send({ externalToken: 'my-successful-external-token' })
        .expect(200);

      const { userToken } = response.body;
      const data = jwt.decode(userToken, '', true);

      expect(data.aud).toEqual('user');
      expect(data.sub).toEqual('google-my-external-id');
      expect(data.provider).toEqual('google');

      await request(server)
        .get('/api/retros')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});
