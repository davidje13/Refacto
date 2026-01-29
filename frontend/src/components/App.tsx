import { lazy, Suspense, type FunctionComponent } from 'react';
import { Route, Switch } from 'wouter';
import { RedirectRoute } from './RedirectRoute';
import { Footer } from './Footer';
import { Header } from './common/Header';
import { LoadingIndicator } from './common/Loader';
import { LoginCallback } from './login/LoginCallback';
import { RetroRouter } from './RetroRouter';
import { WatchRetro } from './WatchRetro';
import { RetroPreviewPage } from './retro-formats/RetroPreviewPage';
import { WelcomePage } from './welcome/WelcomePage';
import { SecurityPage } from './security/SecurityPage';
import { RetroCreatePage } from './retro-create/RetroCreatePage';
import { NotFoundPage } from './not-found/NotFoundPage';
import './App.css';

const LazyGuidancePage = lazy(() =>
  import('./guidance/GuidancePage').then((m) => ({ default: m.GuidancePage })),
);

const LazyApiDocsPage = lazy(() =>
  import('./api-docs/ApiDocsPage').then((m) => ({ default: m.ApiDocsPage })),
);

export const App: FunctionComponent = () => (
  <>
    <Suspense fallback={LOADER}>
      <Switch>
        <Route path="/sso/:service">
          {({ service }) => <LoginCallback service={service} />}
        </Route>
        <Route path="/">
          <WelcomePage />
        </Route>
        <Route path="/security">
          <SecurityPage />
        </Route>
        <Route path="/guidance">
          <LazyGuidancePage />
        </Route>
        <Route path="/api-docs">
          <LazyApiDocsPage />
        </Route>
        <Route path="/create">
          <RetroCreatePage />
        </Route>
        <Route path="/create/import">
          <RetroCreatePage showImport />
        </Route>
        <Route path="/retros/:slug/*?">
          {({ slug }) => <RetroRouter slug={slug} />}
        </Route>
        <Route path="/watch/:retroId">
          {({ retroId }) => <WatchRetro retroId={retroId} />}
        </Route>
        <Route path="/preview">
          <RetroPreviewPage />
        </Route>

        <RedirectRoute path="/retros" to="/" replace />
        <RedirectRoute path="/retro/:slug" to="/retros/:slug" replace />
        <RedirectRoute path="/:slug" to="/retros/:slug" replace />

        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </Suspense>
    <Footer />
  </>
);

const LOADER = (
  <article className="page-loading">
    <Header documentTitle="Refacto" title="Refacto" />
    <LoadingIndicator />
  </article>
);
