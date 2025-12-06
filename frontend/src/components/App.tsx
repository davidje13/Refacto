import type { FC } from 'react';
import { Route, Switch } from 'wouter';
import { RedirectRoute } from './RedirectRoute';
import { Footer } from './Footer';
import { LoginCallback } from './login/LoginCallback';
import { RetroRouter } from './RetroRouter';
import { WelcomePage } from './welcome/WelcomePage';
import { SecurityPage } from './security/SecurityPage';
import { GuidancePage } from './guidance/GuidancePage';
import { RetroCreatePage } from './retro-create/RetroCreatePage';
import { NotFoundPage } from './not-found/NotFoundPage';
import './App.css';

export const App: FC = () => (
  <>
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
        <GuidancePage />
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

      <RedirectRoute path="/retros" to="/" replace />
      <RedirectRoute path="/retro/:slug" to="/retros/:slug" replace />
      <RedirectRoute path="/:slug" to="/retros/:slug" replace />

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
    <Footer />
  </>
);
