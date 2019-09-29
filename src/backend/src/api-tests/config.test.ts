import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory from '../app';

describe('API client config', () => {
  const server = testServerRunner(() => appFactory(testConfig({
    sso: {
      google: {
        clientId: 'abc',
        authUrl: 'foobar',
        tokenInfoUrl: 'woo',
      },
    },
  })));

  describe('/api/config', () => {
    it('responds with client-visible configuration', async () => {
      const response = await request(server)
        .get('/api/config')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.sso.google.clientId).toEqual('abc');
    });

    it('excludes private data', async () => {
      const response = await request(server)
        .get('/api/config')
        .expect(200);

      expect(response.body.sso.google.tokenInfoUrl).toEqual(undefined);
    });

    it('skips SSO data for unconfigured services', async () => {
      const response = await request(server)
        .get('/api/config')
        .expect(200);

      expect(response.body.sso.github).toEqual(undefined);
    });
  });
});
