import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import jwt from 'jwt-simple';
import testConfig from './testConfig';
import testServerRunner, { addressToString } from './testServerRunner';
import appFactory from '../app';

describe('/api/sso/service', () => {
  const mockSsoServer = testServerRunner(() => {
    const ssoApp = new WebSocketExpress();
    ssoApp.use(WebSocketExpress.urlencoded({ extended: false }));
    ssoApp.get('/', (req, res) => res.json({
      aud: 'my-client-id',
      sub: 'my-external-id',
    }));
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

  it('returns a signed JWT token with the user ID', async () => {
    const response = await request(server)
      .post('/api/sso/google')
      .send({ externalToken: 'my-external-token' })
      .expect(200);

    const { userToken } = response.body;
    const data = jwt.decode(userToken, '', true);

    expect(data.aud).toEqual('user');
    expect(data.sub).toEqual('google-my-external-id');
    expect(data.iss).toEqual('google');

    await request(server)
      .get('/api/retros')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});
