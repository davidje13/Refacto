import React from 'react';
import {
  Route,
  Switch,
  Redirect,
  RouteComponentProps,
} from 'react-router-dom';
import './App.less';
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
) => ({ match }: RouteComponentProps): React.ReactElement => (
  <Page {...match.params} />
);

const App = (): React.ReactElement => (
  <React.Fragment>
    <Switch>
      <Route path="/sso/:service" exact render={withParams(LoginCallback)} />
      <Route path="/" exact render={withParams(WelcomePage)} />
      <Route path="/security" exact render={withParams(SecurityPage)} />
      <Route path="/create" exact render={withParams(RetroCreatePage)} />
      <Route path="/create/import" exact render={withParams(RetroImportPage)} />
      <Route path="/retros" exact render={withParams(RetroListPage)} />
      <Route path="/retros/:slug" exact render={withParams(RetroPage)} />
      <Route path="/retros/:slug/archives" exact render={withParams(ArchiveListPage)} />
      <Route path="/retros/:slug/archives/:archiveId" exact render={withParams(ArchivePage)} />
      <Route path="/retros/:slug/settings" exact render={withParams(RetroSettingsPage)} />

      <Redirect from="/retro/:slug" exact to="/retros/:slug" />
      <Redirect from="/:slug" exact to="/retros/:slug" />

      <Route render={withParams(NotFoundPage)} />
    </Switch>
    <Footer />
  </React.Fragment>
);

forbidExtraProps(App);

export default App;
