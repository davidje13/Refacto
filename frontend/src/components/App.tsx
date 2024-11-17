import { type FC, type ReactNode } from 'react';
import { Route, Switch } from 'wouter';
import { RedirectRoute } from './RedirectRoute';
import { Footer } from './Footer';
import { LoginCallback } from './login/LoginCallback';
import { RetroRouter } from './RetroRouter';
import { WelcomePage } from './welcome/WelcomePage';
import { SecurityPage } from './security/SecurityPage';
import { RetroCreatePage } from './retro-create/RetroCreatePage';
import { RetroImportPage } from './retro-create/RetroImportPage';
import { RetroListPage } from './retro-list/RetroListPage';
import { NotFoundPage } from './not-found/NotFoundPage';
import './App.less';

export const App: FC = () => (
  <>
    <Switch>
      <Route path="/sso/:service">
        {({ service = '' }): ReactNode => (
          <LoginCallback service={decodeURIComponent(service)} />
        )}
      </Route>
      <Route path="/">
        <WelcomePage />
      </Route>
      <Route path="/security">
        <SecurityPage />
      </Route>
      <Route path="/create">
        <RetroCreatePage />
      </Route>
      <Route path="/create/import">
        <RetroImportPage />
      </Route>
      <Route path="/retros">
        <RetroListPage />
      </Route>
      <Route path="/retros/:slug/:rest*">
        {({ slug = '' }) => <RetroRouter slug={decodeURIComponent(slug)} />}
      </Route>

      <RedirectRoute path="/retro/:slug" to="/retros/:slug" replace />
      <RedirectRoute path="/:slug" to="/retros/:slug" replace />

      <Route path="/:rest*">
        <NotFoundPage />
      </Route>
    </Switch>
    <Footer />
  </>
);
