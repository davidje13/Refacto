import request from 'superwstest';
import app, { retroService, authService } from './app';

retroService.simulatedDelay = 0;
authService.simulatedDelay = 0;
authService.simulatedSocketDelay = 0;

async function addTestData() {
  const r1 = await retroService.createRetro(
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
  authService.setPassword(r1, 'password');

  const r2 = await retroService
    .createRetro('my-second-retro', 'My Second Retro', 'mood');
  authService.setPassword(r2, 'pa55w0rd');

  const r3 = await retroService
    .createRetro('unknown-retro', 'An Unknown Retro Format', 'nope');
  authService.setPassword(r3, '12345');

  const a1a = await retroService.createArchive(r1);
  const a1b = await retroService.createArchive(r1);
  const a2 = await retroService.createArchive(r2);

  return [r1, r2, r3, a1a, a1b, a2];
}

describe('Server', () => {
  let server;
  let r1;
  let r2;
  let a1a;
  let a2;

  beforeAll(async () => {
    [r1, r2, , a1a, , a2] = await addTestData();
  });

  beforeEach((done) => {
    server = app.createServer();
    server.listen(0, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  async function getToken(retroId, password) {
    const response = await request(server)
      .post(`/api/auth/tokens/${retroId}`)
      .send({ password })
      .expect(200);
    return response.body.token;
  }

  describe('/api/retros', () => {
    it('responds with retros in JSON format', async () => {
      const response = await request(server)
        .get('/api/retros')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retros.length).toBeGreaterThan(0);
    });
  });

  describe('/api/slugs/slug', () => {
    it('responds with a retro ID', async () => {
      const response = await request(server)
        .get('/api/slugs/my-retro')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toEqual(r1);
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
        .post(`/api/auth/tokens/${r1}`)
        .send({ password: 'password' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.token).toBeTruthy();
      expect(response.body.error).not.toBeTruthy();
    });

    it('responds HTTP Bad Request for incorrect password', async () => {
      const response = await request(server)
        .post(`/api/auth/tokens/${r1}`)
        .send({ password: 'nope' })
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.token).not.toBeTruthy();
      expect(response.body.error).toEqual('incorrect password');
    });

    it('responds HTTP Bad Request for unknown retro IDs', async () => {
      await request(server)
        .post('/api/auth/tokens/nope')
        .send({ password: 'anything' })
        .expect(400);
    });
  });

  describe('/api/retros/retro-id', () => {
    it('responds with retros in JSON format', async () => {
      const token = await getToken(r1, 'password');
      const response = await request(server)
        .get(`/api/retros/${r1}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.name).toEqual('My Retro');
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${r1}`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${r1}`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial replace-all retro data for known retro IDs', async () => {
      const token = await getToken(r1, 'password');
      await request(server)
        .ws(`/api/retros/${r1}`)
        .send(token)
        .expectJson(({ change }) => (change.$set.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async () => {
      const token = await getToken(r2, 'pa55w0rd');
      await request(server)
        .ws(`/api/retros/${r2}`)
        .send(token)
        .expectJson()
        .sendJson({ change: { name: { $set: 'bar' } }, id: 7 })
        .expectJson(({ change }) => (change.name.$set === 'bar'))
        .close()
        .expectClosed();

      await request(server)
        .ws(`/api/retros/${r2}`)
        .send(token)
        .expectJson(({ change }) => (change.$set.name === 'bar'))
        .close()
        .expectClosed();
    });

    it('closes the connection for incorrect tokens', async () => {
      await request(server)
        .ws(`/api/retros/${r1}`)
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
      const token = await getToken(r1, 'password');
      const response = await request(server)
        .get(`/api/retros/${r1}/archives/${a1a}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('responds HTTP Unauthorized if no credentials are given', async () => {
      await request(server)
        .get(`/api/retros/${r1}/archives/nope`)
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async () => {
      await request(server)
        .get(`/api/retros/${r1}/archives/nope`)
        .set('Authorization', 'Bearer nope')
        .expect(401);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async () => {
      const token = await getToken(r1, 'password');
      await request(server)
        .get(`/api/retros/${r1}/archives/${a2}`)
        .set('Authorization', `Bearer ${token}`)
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
