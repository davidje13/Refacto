import request from './test-helpers/superwstest';
import app from './app';

describe('Server', () => {
  let server;

  beforeEach((done) => {
    server = app.createServer();
    server.listen(0, done);
  });

  afterEach(() => {
    server.close();
  });

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

      expect(response.body.id).toEqual('r1');
    });

    it('responds HTTP Not Found for unknown slugs', async () => {
      await request(server)
        .get('/api/slugs/nope')
        .expect(404);
    });
  });

  describe('/api/retros/retro-id', () => {
    it('responds with retros in JSON format', async () => {
      const response = await request(server)
        .get('/api/retros/r1')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.name).toEqual('My Retro');
    });

    it('responds HTTP Not Found for unknown IDs', async () => {
      await request(server)
        .get('/api/retros/nope')
        .expect(404);
    });
  });

  describe('ws://api/retros/retro-id', () => {
    it('sends initial replace-all retro data for known retro IDs', async () => {
      await request(server)
        .ws('/api/retros/r1')
        .expectJsonMessage(({ change }) => (change.$set.name === 'My Retro'))
        .close()
        .expectClosed();
    });

    it('reflects update requests and persists changes', async () => {
      await request(server)
        .ws('/api/retros/r2')
        .expectJsonMessage()
        .send(JSON.stringify({ change: { name: { $set: 'bar' } }, id: 7 }))
        .expectJsonMessage(({ change }) => (change.name.$set === 'bar'))
        .close()
        .expectClosed();

      await request(server)
        .ws('/api/retros/r2')
        .expectJsonMessage(({ change }) => (change.$set.name === 'bar'))
        .close()
        .expectClosed();
    });

    it('closes the connection for unknown IDs', async () => {
      await request(server)
        .ws('/api/retros/nope')
        .expectClosed();
    });
  });

  describe('/api/retros/retro-id/archives/archive-id', () => {
    it('responds with retro archives in JSON format', async () => {
      const response = await request(server)
        .get('/api/retros/r1/archives/a1')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('responds HTTP Not Found for unknown IDs', async () => {
      await request(server)
        .get('/api/retros/r1/archives/nope')
        .expect(404);
    });

    it('responds HTTP Not Found for mismatched retro/archive IDs', async () => {
      await request(server)
        .get('/api/retros/r2/archives/a1')
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
