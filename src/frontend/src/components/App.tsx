import React, { Fragment, ReactNode } from 'react';
import { Route, Switch } from 'wouter';
import RedirectRoute from './RedirectRoute';
import Footer from './Footer';
import LoginCallback from './login/LoginCallback';
import RetroRouter from './RetroRouter';
import WelcomePage from './welcome/WelcomePage';
import SecurityPage from './security/SecurityPage';
import RetroCreatePage from './retro-create/RetroCreatePage';
import RetroImportPage from './retro-create/RetroImportPage';
import RetroListPage from './retro-list/RetroListPage';
import NotFoundPage from './not-found/NotFoundPage';
import './App.less';

export default (): React.ReactElement => (
  <Fragment>
    <Switch>
      <Route path="/sso/:service">
        { ({ service }): ReactNode => <LoginCallback service={service} /> }
      </Route>
      <Route path="/"><WelcomePage /></Route>
      <Route path="/security"><SecurityPage /></Route>
      <Route path="/create"><RetroCreatePage /></Route>
      <Route path="/create/import"><RetroImportPage /></Route>
      <Route path="/retros"><RetroListPage /></Route>
      <Route path="/retros/:slug/:rest*">
        { ({ slug }): ReactNode => <RetroRouter slug={slug} /> }
      </Route>

      <RedirectRoute path="/retro/:slug" to="/retros/:slug" replace />
      <RedirectRoute path="/:slug" to="/retros/:slug" replace />

      <Route path="/:rest*"><NotFoundPage /></Route>
    </Switch>
    <Footer />
  </Fragment>
);
