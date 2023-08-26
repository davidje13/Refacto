import request from 'superwstest';
import { WebSocketExpress } from 'websocket-express';
import { testConfig } from './testConfig';
import { addressToString, testServerRunner } from './testServerRunner';
import { appFactory } from '../app';

describe('API giphy', () => {
  const MOCK_GIPHY = testServerRunner(async () => {
    const giphyApp = new WebSocketExpress();
    giphyApp.use(WebSocketExpress.urlencoded({ extended: false }));
    giphyApp.get('/gifs/search', (_, res) => {
      res.json({
        status: 200,
        data: [
          {
            images: {
              fixed_height: { url: 'normal.gif?extra' },
              fixed_height_small: { url: 'small.gif?extra' },
            },
          },
        ],
      });
    });

    return { run: giphyApp.createServer() };
  });

  const PROPS = testServerRunner(async (getTyped) => {
    const app = await appFactory(
      testConfig({
        giphy: {
          baseUrl: addressToString(getTyped(MOCK_GIPHY).server.address()!),
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
        gifs: [{ small: 'small.gif', medium: 'normal.gif' }],
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
