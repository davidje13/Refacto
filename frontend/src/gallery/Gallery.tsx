import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import type { ClientConfig } from '@refacto/shared/api-entities';
import { ConfigProvider } from '../hooks/data/useConfig';
import { Preview, type PreviewContent } from '../components/guidance/Preview';
import { RetroPreviewPage } from '../components/retro-formats/RetroPreviewPage';
import { Footer } from '../components/Footer';
import {
  HEALTH_PREVIEW,
  MOOD_PREVIEW,
  SAMPLE_RETRO,
  SAMPLE_RETRO_PHONE,
  TIMELINE_PREVIEW,
} from './samples';

import '../index.css';
import '../preload.css';
import '../components/App.css';
import './Gallery.css';

// This code is not part of the build - run it with
// MODE=GALLERY npm start

const GalleryPage = () => (
  <div className="page-gallery">
    <div className="light gallery-item">
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
    <DesktopThumb theme="light" content={MOOD_PREVIEW} />
    <DesktopThumb theme="dark" content={MOOD_PREVIEW} />
    <DesktopThumb theme="light" content={HEALTH_PREVIEW} />
    <DesktopThumb theme="dark" content={HEALTH_PREVIEW} />
    <DesktopThumb theme="light" content={TIMELINE_PREVIEW} />
    <DesktopThumb theme="dark" content={TIMELINE_PREVIEW} />
    <PhoneThumb theme="light" content={MOOD_PREVIEW} />
    <PhoneThumb theme="dark" content={MOOD_PREVIEW} />
    <PhoneThumb theme="light" content={HEALTH_PREVIEW} />
    <PhoneThumb theme="dark" content={HEALTH_PREVIEW} />
    <PhoneThumb theme="light" content={TIMELINE_PREVIEW} />
    <PhoneThumb theme="dark" content={TIMELINE_PREVIEW} />
  </div>
);

const DesktopThumb = ({
  theme,
  content,
}: {
  theme: string;
  content: PreviewContent;
}) => (
  <div className={`gallery-item ${theme}`}>
    <Preview
      content={content}
      width={960}
      height={640}
      className="desktop-thumb"
    />
  </div>
);

const PhoneThumb = ({
  theme,
  content,
}: {
  theme: string;
  content: PreviewContent;
}) => (
  <div className={`gallery-item ${theme}`}>
    <Preview
      content={content}
      width={375}
      height={667}
      className="phone-thumb"
    />
  </div>
);

const MOCK_CONFIG: ClientConfig = {
  sso: {},
  passwordRequirements: { minLength: 0, maxLength: 1 },
  maxApiKeys: 1,
  deleteRetroDelay: 1,
  giphy: true,
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
