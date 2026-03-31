import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import type { ClientConfig } from '../shared/api-entities';
import { ConfigProvider } from '../hooks/data/useConfig';
import {
  moodline,
  Preview,
  type PreviewContent,
} from '../components/guidance/Preview';
import { RetroPreviewPage } from '../components/retro-formats/RetroPreviewPage';
import { Footer } from '../components/Footer';

import '../index.css';
import '../preload.css';
import '../components/App.css';
import './Gallery.css';

// This code is not part of the build - run it with
// MODE=GALLERY npm start

const now = Date.parse('2026-01-27T17:08:12Z');

const SAMPLE_RETRO: PreviewContent = {
  format: 'mood',
  simulatedTime: now,
  state: { focusedItemId: 'cur', focusedItemTimeout: now + 282000 },
  items: [
    { category: 'happy', message: 'We can run retros remotely 😃' },
    { category: 'meh', message: 'other retro formats', votes: 2 },
    { category: 'happy', message: 'Everything is awesome!', votes: 7 },
    { category: 'sad', message: 'It rained' },
    {
      id: 'cur',
      category: 'sad',
      message: 'That thing happened',
      attachment: {
        type: 'giphy',
        url: 'https://media3.giphy.com/media/Y4z9olnoVl5QI/200.gif',
        alt: '',
      },
    },
    { category: 'happy', message: 'That TV show' },
    { category: 'action', message: 'do a thing', doneTime: 1 },
  ],
};

const SAMPLE_RETRO_PHONE: PreviewContent = {
  ...SAMPLE_RETRO,
  localState: { 'new-item-happy:value': 'I can add stuff from my phone' },
};

const GalleryPage = () => (
  <div className="page-gallery">
    <div className="gallery-item">
      <div className="docs">
        <Preview
          content={SAMPLE_RETRO}
          width={1280}
          height={780}
          className="browser"
        />
        <div className="phone-frame">
          <Preview
            content={SAMPLE_RETRO_PHONE}
            width={370}
            height={650}
            className="phone"
          />
        </div>
      </div>
    </div>
    <div className="gallery-item">
      <Preview
        content={{
          format: 'mood',
          name: '3 Column',
          simulatedTime: now,
          items: [
            { category: 'happy', message: 'We can run retros remotely 😃' },
            { category: 'meh', message: 'other retro formats', votes: 2 },
            { category: 'happy', message: 'Everything is awesome!', votes: 7 },
            { category: 'sad', message: 'It rained' },
            { category: 'sad', message: 'That thing happened' },
            { category: 'happy', message: 'That TV show' },
            { category: 'action', message: 'do a thing', doneTime: 1 },
          ],
        }}
        width={900}
        height={600}
        className="thumb"
      />
    </div>
    <div className="gallery-item">
      <Preview
        content={{
          format: 'health',
          name: 'Health Check',
          simulatedTime: now,
          items: [],
          localState: {
            'health:own-state-0': { stage: 'answer', user: 'me' },
            'health-progress:me': 'learning',
          },
        }}
        width={900}
        height={600}
        className="thumb"
      />
    </div>
    <div className="gallery-item">
      <Preview
        content={TIMELINE_PREVIEW}
        width={900}
        height={600}
        className="thumb"
      />
    </div>
  </div>
);

const MOCK_CONFIG: ClientConfig = {
  sso: {},
  passwordRequirements: { minLength: 0, maxLength: 1 },
  maxApiKeys: 1,
  deleteRetroDelay: 1,
  giphy: true,
};

const DAY = 1000 * 60 * 60 * 24;
const day = (n: number) => (Math.floor(now / DAY) + n) * DAY;

const TIMELINE_PREVIEW: PreviewContent = {
  format: 'timeline',
  name: 'Timeline',
  simulatedTime: now,
  localState: {
    'timeline:tab': 'draw',
    'timeline:id': '00000000-0000-0000-0000-000000000000',
  },
  state: { endTime: day(56) },
  items: [
    { category: 'event', message: 'Kickoff session', doneTime: day(0) },
    { category: 'event', message: 'Release', doneTime: day(18) },
    { category: 'event', message: 'Angry customer', doneTime: day(34) },
    { category: 'event', message: 'Got an office llama', doneTime: day(40) },
    { category: 'event', message: 'Newspaper article', doneTime: day(54) },
    moodline(
      { id: 'l0', colour: { h: 160 } },
      day(0),
      30,
      22,
      21,
      22,
      28,
      25,
      5,
      0,
      -1,
      -2,
      -2,
      5,
      80,
      50,
      35,
      26,
      20,
      14,
      8,
      6,
    ),
    moodline(
      { id: 'l1', colour: { h: 350 } },
      day(0),
      60,
      20,
      10,
      5,
      4,
      6,
      8,
      20,
      5,
      20,
      5,
      10,
      50,
      90,
      70,
      50,
      40,
      35,
      15,
      5,
    ),
    moodline(
      { id: 'l2', colour: { h: 240 } },
      day(0),
      40,
      41,
      42,
      42,
      40,
      40,
      39,
      38,
      38,
      39,
      40,
      44,
      45,
      5,
      10,
      40,
      51,
      52,
      46,
      41,
    ),
  ],
};

const root = document.createElement('div');
document.getElementById('pre-load')?.remove();
document.body.append(root);
createRoot(root).render(
  <Switch>
    <Route path="/preview">
      <ConfigProvider value={MOCK_CONFIG}>
        <RetroPreviewPage />
        <Footer />
      </ConfigProvider>
    </Route>
    <Route>
      <GalleryPage />
    </Route>
  </Switch>,
);
