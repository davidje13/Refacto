import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { testServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('API spec', () => {
  const PROPS = testServerRunner(async () => ({
    run: await appFactory(new TestLogger(), testConfig()),
  }));

  describe('/api/openapi.json', () => {
    it('returns an OpenAPI spec', async (props) => {
      const { server } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/openapi.json')
        .expect(200)
        .expect('Content-Type', 'application/openapi+json');

      expect(response.body.info.title).toEqual('Refacto API');
    });
  });
});
