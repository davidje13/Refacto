import express from 'express';
import ApiRouter from './routers/ApiRouter';
import StaticRouter from './routers/StaticRouter';
import RetroService from './services/InMemoryRetroService';

const retroService = new RetroService([
  {
    slug: 'my-retro',
    name: 'My Retro',
    format: 'mood',
    state: {
      focusedItemUUID: null,
    },
    items: [
      {
        uuid: 'a1',
        category: 'happy',
        created: 1550614902000,
        message: 'This is good.',
        votes: 0,
        done: false,
      },
      {
        uuid: 'b2',
        category: 'happy',
        created: 1550614903000,
        message: 'This is also good, and popular.',
        votes: 5,
        done: false,
      },
      {
        uuid: 'c3',
        category: 'meh',
        created: 1550614904000,
        message: 'This is alright and has been discussed.',
        votes: 0,
        done: true,
      },
      {
        uuid: 'd4',
        category: 'sad',
        created: 1550614904000,
        message: 'This is not ok.',
        votes: 0,
        done: false,
      },
      {
        uuid: 'e5',
        category: 'action',
        created: 1550614905000,
        message: 'This is an action which has not been done.',
        votes: 0,
        done: false,
      },
      {
        uuid: 'f6',
        category: 'action',
        created: 1550614906000,
        message: 'This is an action which has been done.',
        votes: 0,
        done: true,
      },
    ],
  },
  {
    slug: 'my-second-retro',
    name: 'My Second Retro',
    format: 'mood',
    state: {
      focusedItemUUID: null,
    },
    items: [],
  },
  {
    slug: 'unknown-retro',
    name: 'An Unknown Retro Format',
    format: 'nope',
    state: {},
    items: [],
  },
]);

const app = express();

app.use('/api', new ApiRouter(retroService));
app.use(new StaticRouter());

export default app;
