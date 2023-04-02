import request from 'superwstest';
import { testConfig } from './testConfig';
import { testServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('API slugs', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    const retroId = await app.testHooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    return { run: app, retroId };
  });

  describe('/api/slugs/slug', () => {
    it('responds with a retro ID and name', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/slugs/my-retro')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toEqual(retroId);
    });

    it('responds HTTP Not Found for unknown slugs', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .get('/api/slugs/nope')
        .expect(404);
    });

    it('adds common headers', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .get('/api/slugs/my-retro')
        .expect('X-Frame-Options', 'DENY');
    });

    it('adds API headers', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .get('/api/slugs/my-retro')
        .expect('Cache-Control', 'no-cache, no-store');
    });
  });
});
