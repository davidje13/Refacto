import request from 'superwstest';
import testConfig from './testConfig';
import appFactory from '../app';

describe('API', () => {
  let hooks;
  let testIds;
  let server;

  beforeEach(async () => {
    const app = await appFactory(testConfig({
      token: {
        secretPassphrase: 'foobar',
      },
    }));

    hooks = app.testHooks;
    const {
      retroService,
      retroAuthService,
    } = hooks;

    const r1 = await retroService.createRetro(
      'nobody',
      'my-retro',
      'My Retro',
      'mood',
    );

    const r2 = await retroService
      .createRetro('me', 'my-second-retro', 'My Second Retro', 'mood');

    const r3 = await retroService
      .createRetro('nobody', 'unknown-retro', 'An Unknown Retro Format', 'nope');

    await Promise.all([
      retroAuthService.setPassword(r1, 'password'),
      retroAuthService.setPassword(r2, 'pa55w0rd'),
      retroAuthService.setPassword(r3, '12345678'),
    ]);

    testIds = {
      r1,
      r2,
      r3,
    };

    server = app.createServer();
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  function getRetroToken(retroId) {
    return hooks.retroAuthService.grantToken(retroId, {
      read: true,
      readArchives: true,
      write: true,
    });
  }

  function getUserToken(userId) {
    return hooks.userAuthService.grantToken({
      provider: 'test',
      id: userId,
    });
  }

  describe('/api/retros', () => {
    it('responds with retros for the user in JSON format', async () => {
      const userToken = await getUserToken('me');
      const response = await request(server)
        .get('/api/retros')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retros.length).toEqual(1);
      expect(response.body.retros[0].slug).toEqual('my-second-retro');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get('/api/retros')
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('POST /api/retros', () => {
    it('creates a new retro', async () => {
      const slug = 'new-retro';
      const userToken = await getUserToken('me');
      const response = await request(server)
        .post('/api/retros')
        .send({ slug, name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const returnedId = response.body.id;
      const storedId = await hooks.retroService.getRetroIdForSlug(slug);

      expect(returnedId).toEqual(storedId);
    });

    it('responds HTTP Bad Request if data is missing', async () => {
      const userToken = await getUserToken('me');
      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: 'Meh' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toEqual('No password given');
    });

    it('responds HTTP Conflict if slug is unavailable', async () => {
      const userToken = await getUserToken('me');
      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'my-retro', name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(response.body.error).toEqual('URL is already taken');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .post('/api/retros')
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .post('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial replace-all retro data for known retro IDs', async () => {
      const retroToken = await getRetroToken(testIds.r1);
      await request(server)
        .ws(`/api/retros/${testIds.r1}`)
        .send(retroToken)
        .expectJson(({ change }) => (change.$set.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async () => {
      const retroToken = await getRetroToken(testIds.r2);
      await request(server)
        .ws(`/api/retros/${testIds.r2}`)
        .send(retroToken)
        .expectJson()
        .sendJson({ change: { name: { $set: 'bar' } }, id: 7 })
        .expectJson(({ change }) => (change.name.$set === 'bar'))
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${testIds.r2}`)
        .send(retroToken)
        .expectJson(({ change }) => (change.$set.name === 'bar'))
        .close()
        .expectClosed();
    });

    it('closes the connection for incorrect tokens', async () => {
      await request(server)
        .ws(`/api/retros/${testIds.r1}`)
        .send('nope')
        .expectClosed();
    });

    it('closes the connection for unknown IDs', async () => {
      await request(server)
        .ws('/api/retros/nope')
        .send('any-token')
        .expectClosed();
    });
  });
});
