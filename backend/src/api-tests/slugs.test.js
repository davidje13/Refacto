import request from 'superwstest';
import testConfig from './testConfig';
import appFactory from '../app';

describe('API Slugs', () => {
  let retroId1;
  let server;

  beforeEach(async () => {
    const app = await appFactory(testConfig());

    retroId1 = await app.testHooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    server = app.createServer();
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  describe('/api/slugs/slug', () => {
    it('responds with a retro ID and name', async () => {
      const response = await request(server)
        .get('/api/slugs/my-retro')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toEqual(retroId1);
    });

    it('responds HTTP Not Found for unknown slugs', async () => {
      await request(server)
        .get('/api/slugs/nope')
        .expect(404);
    });
  });
});
