import express from 'express';
import ApiRouter from './routers/ApiRouter';
import StaticRouter from './routers/StaticRouter';
import RetroService from './services/InMemoryRetroService';

const retroService = new RetroService([
  {
    slug: 'my-retro',
    name: 'My Retro',
  },
  {
    slug: 'my-second-retro',
    name: 'My Second Retro',
  },
]);

const app = express();

app.use('/api', new ApiRouter(retroService));
app.use(new StaticRouter());

export default app;
