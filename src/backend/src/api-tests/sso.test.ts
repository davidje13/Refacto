import { WebSocketExpress } from 'websocket-express';
import request from 'superwstest';
import jwt from 'jwt-simple';
import { testConfig } from './testConfig';
import { testServerRunner, addressToString } from './testServerRunner';
import { appFactory } from '../app';

describe('/api/sso/service', () => {
  const MOCK_SSO = testServerRunner(() => {
    const ssoApp = new WebSocketExpress();
    ssoApp.use(WebSocketExpress.urlencoded({ extended: false }));
    ssoApp.get('/', (_, res) =>
      res.json({
        aud: 'my-client-id',
        sub: 'my-external-id',
      }),
    );
    return { run: ssoApp.createServer() };
  });

  const APP = testServerRunner(async (getTyped) => ({
    run: await appFactory(
      testConfig({
        sso: {
          google: {
            clientId: 'my-client-id',
            authUrl: 'foo',
            tokenInfoUrl: addressToString(getTyped(MOCK_SSO).server.address()),
          },
        },
      }),
    ),
  }));

  it('returns a signed JWT token with the user ID', async (props) => {
    const { server } = props.getTyped(APP);

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
