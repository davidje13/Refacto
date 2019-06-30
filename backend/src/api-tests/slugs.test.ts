import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner from './testServerRunner';
import appFactory from '../app';

describe('API slugs', () => {
  let retroId: string;

  const server = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    retroId = await app.testHooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    return app.createServer();
  });

  describe('/api/slugs/slug', () => {
    it('responds with a retro ID and name', async () => {
      const response = await request(server)
        .get('/api/slugs/my-retro')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toEqual(retroId);
    });

    it('responds HTTP Not Found for unknown slugs', async () => {
      await request(server)
        .get('/api/slugs/nope')
        .expect(404);
    });
  });
});
