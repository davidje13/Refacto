import type { Server } from 'node:http';
import { getAddressURL } from 'web-listener';
import { decodeJWT } from 'authentication-backend/jwt';
import { buildMockSSO } from 'authentication-backend/mock';
import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { testServerRunner, testSimpleServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('/api/sso/service', () => {
  const MOCK_SSO = testSimpleServerRunner(() => buildMockSSO());

  const APP = testServerRunner(async (getTyped) => ({
    run: await appFactory(
      new TestLogger(),
      testConfig({
        sso: {
          google: {
            clientId: 'my-client-id',
            authUrl: 'foo',
            certsUrl: getAddressURL(getTyped(MOCK_SSO).address()) + '/certs',
          },
        },
      }),
    ),
  }));

  it('returns a signed JWT token with the user ID', async (props) => {
    const token = await getSignedToken(props.getTyped(MOCK_SSO), {
      nonce: 'my-nonce',
      client_id: 'my-client-id',
      identifier: 'my-external-id',
    });

    const { server } = props.getTyped(APP);

    const response = await request(server)
      .post('/api/sso/google')
      .send({ externalToken: token })
      .expect(200);

    const { userToken } = response.body;
    const data = decodeJWT(userToken, {
      verifyKey: false,
      verifyIss: 'google',
      verifyAud: 'user',
      verifyActive: true,
    });

    expect(data.payload.sub).toEqual('google-my-external-id');

    await request(server)
      .get('/api/retros')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});

describe('/api/sso/public', () => {
  const APP = testServerRunner(async () => ({
    run: await appFactory(
      new TestLogger(),
      testConfig({
        insecure: {
          sharedAccount: { enabled: true, authUrl: '/insecure-login' },
        },
      }),
    ),
  }));

  it('returns a signed JWT token with the user ID', async (props) => {
    const { server } = props.getTyped(APP);

    const response1 = await request(server)
      .get('/insecure-login?redirect_uri=http://example.com/&state={}')
      .expect(303);

    const url = new URL(response1.headers['location']!);
    expect(url.host).toEqual('example.com');
    const urlParams = new URLSearchParams(url.hash.substring(1));
    const externalToken = urlParams.get('token')!;
    expect(externalToken.length).toBeGreaterThan(10);

    const response2 = await request(server)
      .post('/api/sso/public')
      .send({ externalToken })
      .expect(200);

    const { userToken } = response2.body;
    const data = decodeJWT(userToken, {
      verifyKey: false,
      verifyIss: 'public',
      verifyAud: 'user',
      verifyActive: true,
    });

    expect(data.payload.sub).toEqual('everybody');

    await request(server)
      .get('/api/retros')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});

async function getSignedToken(mock: Server, payload: Record<string, unknown>) {
  const tokenResponse = await fetch(getAddressURL(mock.address()) + '/auth', {
    method: 'POST',
    body: new URLSearchParams({
      redirect_uri: 'https://example.com',
      ...payload,
    }).toString(),
    redirect: 'manual',
  });
  const tokenParams = new URLSearchParams(
    new URL(tokenResponse.headers.get('location') ?? '').hash.substring(1),
  );
  return tokenParams.get('id_token');
}
