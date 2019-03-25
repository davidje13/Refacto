import React from 'react';
import { Route, Switch } from 'react-router-dom';
import forbidExtraProps from '../helpers/forbidExtraProps';
import Footer from './Footer';
import WelcomePage from './welcome/WelcomePage';
import RetroListPage from './retro-list/RetroListPage';
import RetroPage from './retro/RetroPage';
import ArchiveListPage from './archive-list/ArchiveListPage';
import ArchivePage from './archive/ArchivePage';
import NotFoundPage from './not-found/NotFoundPage';
import './App.less';

/* eslint-disable-next-line react/prop-types */ // utility function
const withParams = (Page) => ({ match }) => (<Page {...match.params} />);

const App = () => (
  <React.Fragment>
    <Switch>
      <Route path="/" exact render={withParams(WelcomePage)} />
      <Route path="/retros" exact render={withParams(RetroListPage)} />
      <Route path="/retros/:slug" exact render={withParams(RetroPage)} />
      <Route path="/retros/:slug/archives" exact render={withParams(ArchiveListPage)} />
      <Route path="/retros/:slug/archives/:archiveId" exact render={withParams(ArchivePage)} />
      <Route render={withParams(NotFoundPage)} />
    </Switch>
    <Footer />
  </React.Fragment>
);

forbidExtraProps(App);

export default App;
