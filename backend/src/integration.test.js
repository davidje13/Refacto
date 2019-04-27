import request from 'superwstest';
import appFactory from './app';

const config = {
  hasherWorkFactor: 5,
  secretPepper: 'abc',
  secretPrivateKeyPassphrase: 'foobar',
  simulatedDelay: 0,
  simulatedSocketDelay: 0,
  sso: {},
};

async function makeTestApp() {
  const app = await appFactory(config);
  const { retroService, retroAuthService } = app.testHooks;

  const r1 = await retroService.createRetro(
    'nobody',
    'my-retro',
    'My Retro',
    'mood',
    {
      items: [
        {
          id: 'z9',
          category: 'happy',
          created: Date.now() - (86400000 * 10) - 198000,
          message: 'An archived happy item.',
          votes: 2,
          done: false,
        },
      ],
    },
  );

  const r2 = await retroService
    .createRetro('me', 'my-second-retro', 'My Second Retro', 'mood');

  const r3 = await retroService
    .createRetro('nobody', 'unknown-retro', 'An Unknown Retro Format', 'nope');

  const a1a = await retroService.createArchive(r1);
  const a1b = await retroService.createArchive(r1);
  const a2a = await retroService.createArchive(r2);

  await Promise.all([
    retroAuthService.setPassword(r1, 'password'),
    retroAuthService.setPassword(r2, 'pa55w0rd'),
    retroAuthService.setPassword(r3, '12345678'),
  ]);

  return [
    app,
    {
      r1,
      r2,
      r3,
      a1a,
      a1b,
      a2a,
    },
  ];
}

describe('Server', () => {
  let app;
  let testIds;
  let server;

  beforeEach((done) => {
    makeTestApp().then((testInfo) => {
      [app, testIds] = testInfo;
      server = app.createServer();
      server.listen(0, done);
    });
  });

  afterEach((done) => {
    server.close(done);
  });

  function getRetroToken(retroId) {
    return app.testHooks.retroAuthService.grantToken(retroId, {
      read: true,
      readArchives: true,
      write: true,
    });
  }

  function getUserToken(userId) {
    return app.testHooks.userAuthService.grantToken({
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

  describe('/api/slugs/slug', () => {
    it('responds with a retro ID', async () => {
      const response = await request(server)
        .get('/api/slugs/my-retro')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toEqual(testIds.r1);
    });

    it('responds HTTP Not Found for unknown slugs', async () => {
      await request(server)
        .get('/api/slugs/nope')
        .expect(404);
    });
  });

  describe('/api/auth/tokens/retro-id', () => {
    it('responds with a token for the correct password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${testIds.r1}`)
        .send({ password: 'password' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('responds HTTP Bad Request for incorrect password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${testIds.r1}`)
        .send({ password: 'nope' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retroToken).not.toBeTruthy();
      expect(response.body.error).toEqual('incorrect password');
    });

    it('responds HTTP Bad Request for unknown retro IDs', async () => {
      await request(server)
        .post('/api/auth/tokens/nope')
        .send({ password: 'anything' })
        .expect(400);
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

  describe('/api/retros/retro-id/archives/archive-id', () => {
    it('responds with retro archives in JSON format', async () => {
      const retroToken = await getRetroToken(testIds.r1);
      const response = await request(server)
        .get(`/api/retros/${testIds.r1}/archives/${testIds.a1a}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${testIds.r1}/archives/nope`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${testIds.r1}/archives/nope`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async () => {
      const retroToken = await getRetroToken(testIds.r1);
      await request(server)
        .get(`/api/retros/${testIds.r1}/archives/${testIds.a2a}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(404);
    });
  });

  describe('Static content', () => {
    it('responds with index.html for root requests', async () => {
      const response = await request(server)
        .get('/')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });

    it('responds with index.html for all unknown requests', async () => {
      const response = await request(server)
        .get('/foobar')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });
  });
});
