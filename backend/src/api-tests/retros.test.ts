import request from 'superwstest';
import { testConfig } from './testConfig';
import { testServerRunner } from './testServerRunner';
import { appFactory, type TestHooks } from '../app';

function getUserToken({ userAuthService }: TestHooks, userId: string): string {
  return userAuthService.grantToken({
    aud: 'user',
    iss: 'test',
    sub: userId,
  });
}

describe('API retros', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(testConfig());

    const hooks = app.testHooks;

    await hooks.retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    await hooks.retroService.createRetro(
      'me',
      'my-second-retro',
      'My Second Retro',
      'mood',
    );

    await hooks.retroService.createRetro(
      'nobody',
      'unknown-retro',
      'An Unknown Retro Format',
      'nope',
    );

    return { run: app, hooks };
  });

  describe('/api/retros', () => {
    it('responds with retros for the user in JSON format', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'me');

      const response = await request(server)
        .get('/api/retros')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retros.length).toEqual(1);
      expect(response.body.retros[0].slug).toEqual('my-second-retro');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server).get('/api/retros').expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .get('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('POST /api/retros', () => {
    it('creates a new retro', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const slug = 'new-retro';
      const userToken = getUserToken(hooks, 'me');

      const response = await request(server)
        .post('/api/retros')
        .send({ slug, name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const storedId = await hooks.retroService.getRetroIdForSlug(slug);

      expect(response.body.id).toEqual(storedId);
      expect(response.body.token).toBeTruthy();
    });

    it('responds HTTP Bad Request if data is missing', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'me');

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: 'Meh' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toEqual('Expected string');
    });

    it('responds HTTP Bad Request if data is blank', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'me');

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: '', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toEqual('No name given');
    });

    it('responds HTTP Conflict if slug is unavailable', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const userToken = getUserToken(hooks, 'me');

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'my-retro', name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(response.body.error).toEqual('URL is already taken');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server).post('/api/retros').expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .post('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });
});
