import React from 'react';
import {
  Route,
  Switch,
  RouteComponentProps,
} from 'wouter';
import './App.less';
import RedirectRoute from './RedirectRoute';
import forbidExtraProps from '../helpers/forbidExtraProps';
import Footer from './Footer';
import LoginCallback from './login/LoginCallback';
import WelcomePage from './welcome/WelcomePage';
import SecurityPage from './security/SecurityPage';
import RetroCreatePage from './retro-create/RetroCreatePage';
import RetroImportPage from './retro-create/RetroImportPage';
import RetroListPage from './retro-list/RetroListPage';
import RetroPage from './retro/RetroPage';
import ArchiveListPage from './archive-list/ArchiveListPage';
import ArchivePage from './archive/ArchivePage';
import RetroSettingsPage from './retro-settings/RetroSettingsPage';
import NotFoundPage from './not-found/NotFoundPage';

const withParams = (
  Page: React.ComponentType<any>,
) => ({ params }: RouteComponentProps): React.ReactElement => (
  <Page {...params} />
);

const App = (): React.ReactElement => (
  <React.Fragment>
    <Switch>
      <Route path="/sso/:service" component={withParams(LoginCallback)} />
      <Route path="/" component={withParams(WelcomePage)} />
      <Route path="/security" component={withParams(SecurityPage)} />
      <Route path="/create" component={withParams(RetroCreatePage)} />
      <Route path="/create/import" component={withParams(RetroImportPage)} />
      <Route path="/retros" component={withParams(RetroListPage)} />
      <Route path="/retros/:slug" component={withParams(RetroPage)} />
      <Route path="/retros/:slug/archives" component={withParams(ArchiveListPage)} />
      <Route path="/retros/:slug/archives/:archiveId" component={withParams(ArchivePage)} />
      <Route path="/retros/:slug/settings" component={withParams(RetroSettingsPage)} />

      <RedirectRoute path="/retro/:slug" to="/retros/:slug" replace />
      <RedirectRoute path="/:slug" to="/retros/:slug" replace />

      <Route path="/:rest*" component={withParams(NotFoundPage)} />
    </Switch>
    <Footer />
  </React.Fragment>
);

forbidExtraProps(App);

export default App;
