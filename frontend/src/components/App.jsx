import React from 'react';
import { Route, Switch } from 'react-router-dom';
import forbidExtraProps from '../helpers/forbidExtraProps';
import WelcomePage from './welcome/WelcomePage';
import RetroListPage from './retro-list/RetroListPage';
import RetroPage from './retro/RetroPage';
import NotFoundPage from './not-found/NotFoundPage';

export const App = () => (
  <Switch>
    <Route path="/" exact component={WelcomePage} />
    <Route path="/retros" exact component={RetroListPage} />
    <Route path="/retros/:slug" exact component={RetroPage} />
    <Route component={NotFoundPage} />
  </Switch>
);

forbidExtraProps(App);

export default App;
