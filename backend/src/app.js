import express from 'express';
import ApiRouter from './routers/ApiRouter';
import StaticRouter from './routers/StaticRouter';
import RetroService from './services/InMemoryRetroService';

const now = Date.now();

const retroService = new RetroService([
  {
    uuid: 'r1',
    slug: 'my-retro',
    name: 'My Retro',
    state: {
      focusedItemUUID: null,
      focusedItemTimeout: 0,
    },
    data: {
      format: 'mood',
      items: [
        {
          uuid: 'a1',
          category: 'happy',
          created: now - 199000,
          message: 'This is good.',
          votes: 0,
          done: false,
        },
        {
          uuid: 'b2',
          category: 'happy',
          created: now - 198000,
          message: 'This is also good, and popular.',
          votes: 5,
          done: false,
        },
        {
          uuid: 'c3',
          category: 'meh',
          created: now - 197000,
          message: 'This is alright and has been discussed.',
          votes: 0,
          done: true,
        },
        {
          uuid: 'd4',
          category: 'sad',
          created: now - 196000,
          message: 'This is not ok.',
          votes: 0,
          done: false,
        },
        {
          uuid: 'e5',
          category: 'action',
          created: now - 195000,
          message: 'This is an action which has not been done.',
          votes: 0,
          done: false,
        },
        {
          uuid: 'f6',
          category: 'action',
          created: now - 194000,
          message: 'This is an action which has been done.',
          votes: 0,
          done: true,
        },
        {
          uuid: 'g7',
          category: 'action',
          created: now - (86400000 * 7),
          message: 'This is an outstanding action from the last retro.',
          votes: 0,
          done: false,
        },
        {
          uuid: 'h8',
          category: 'action',
          created: now - (86400000 * 8),
          message: 'This is an outstanding action from the distant past.',
          votes: 0,
          done: false,
        },
      ],
    },
    archives: [
      {
        uuid: 'a1',
        created: now - (86400000 * 10),
        data: {
          format: 'mood',
          items: [
            {
              uuid: 'z9',
              category: 'happy',
              created: now - (86400000 * 10) - 198000,
              message: 'An archived happy item.',
              votes: 2,
              done: false,
            },
            {
              uuid: 'y8',
              category: 'sad',
              created: now - (86400000 * 10) - 199000,
              message: 'An archived, completed, sad item.',
              votes: 0,
              done: true,
            },
            {
              uuid: 'x7',
              category: 'action',
              created: now - (86400000 * 10) - 197000,
              message: 'An archived action.',
              votes: 0,
              done: true,
            },
          ],
        },
      },
      {
        uuid: 'b2',
        created: now - (86400000 * 12),
        data: {
          format: 'mood',
          items: [],
        },
      },
    ],
  },
  {
    uuid: 'r2',
    slug: 'my-second-retro',
    name: 'My Second Retro',
    state: {
      focusedItemUUID: null,
      focusedItemTimeout: 0,
    },
    data: {
      format: 'mood',
      items: [],
    },
    archives: [
      {
        uuid: 'a3',
        created: now - (86400000 * 10),
        data: {
          format: 'mood',
          items: [],
        },
      },
    ],
  },
  {
    uuid: 'r3',
    slug: 'unknown-retro',
    name: 'An Unknown Retro Format',
    state: {},
    data: {
      format: 'nope',
      items: [],
    },
    archives: [],
  },
]);

const app = express();

app.use('/api', new ApiRouter(retroService));
app.use(new StaticRouter());

export default app;
