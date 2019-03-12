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

export const App = () => (
  <React.Fragment>
    <Switch>
      <Route path="/" exact component={WelcomePage} />
      <Route path="/retros" exact component={RetroListPage} />
      <Route path="/retros/:slug" exact component={RetroPage} />
      <Route path="/retros/:slug/archives" exact component={ArchiveListPage} />
      <Route path="/retros/:slug/archives/:archiveid" exact component={ArchivePage} />
      <Route component={NotFoundPage} />
    </Switch>
    <Footer />
  </React.Fragment>
);

forbidExtraProps(App);

export default App;
