import request from 'supertest';
import app from './app';

describe('Backend server', () => {
  it('responds with index.html for root requests', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    expect(response.text).toContain('<title>Example Static Resource</title>');
  });
});
