import request from 'superwstest';
import { WebSocketExpress } from 'websocket-express';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import { addressToString, testServerRunner } from './testServerRunner';
import type { GiphyResponse } from '../services/GiphyService';
import { appFactory } from '../app';

describe('API giphy', () => {
  const MOCK_GIPHY = testServerRunner(async () => {
    const giphyApp = new WebSocketExpress();
    const response: GiphyResponse = {
      meta: { status: 200 },
      data: [
        {
          alt_text: 'An image',
          images: {
            original: {
              url: 'http://example.com/original.gif?extra',
              webp: 'http://example.com/original.webp?extra',
            },
            fixed_height: {
              url: 'http://example.com/medium.gif?extra',
              webp: 'http://example.com/medium.webp?extra',
            },
            fixed_height_small: { url: 'http://example.com/small.gif?extra' },
          },
        },
        {
          images: {
            original: { url: 'http://example.com/original2.gif' },
          },
        },
      ],
      pagination: {},
    };
    giphyApp.use(WebSocketExpress.urlencoded({ extended: false }));
    giphyApp.get('/gifs/search', (_, res) => {
      res.json(response);
    });

    return { run: giphyApp.createServer() };
  });

  const PROPS = testServerRunner(async (getTyped) => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({
        giphy: {
          baseUrl: addressToString(getTyped(MOCK_GIPHY).server.address()),
          apiKey: 'my-giphy-key',
        },
      }),
    );

    return { run: app };
  });

  describe('/api/giphy/search', () => {
    it('proxies to giphy', async (props) => {
      const { server } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/giphy/search?q=thing')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual({
        gifs: [
          {
            small: 'http://example.com/small.gif',
            medium: 'http://example.com/medium.webp',
            alt: 'An image',
          },
          {
            small: 'http://example.com/original2.gif',
            medium: 'http://example.com/original2.gif',
          },
        ],
      });
    });

    it('returns an error if no search is given', async (props) => {
      const { server } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/giphy/search?q=')
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual({ error: 'Bad request' });
    });
  });
});
