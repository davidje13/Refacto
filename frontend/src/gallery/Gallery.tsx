import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import type { ClientConfig } from '../shared/api-entities';
import { ConfigProvider } from '../hooks/data/useConfig';
import { Preview, type PreviewContent } from '../components/guidance/Preview';
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
  </div>
);

const MOCK_CONFIG: ClientConfig = {
  sso: {},
  passwordRequirements: { minLength: 0, maxLength: 1 },
  maxApiKeys: 1,
  deleteRetroDelay: 1,
  giphy: true,
};

createRoot(document.getElementById('root')!).render(
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
