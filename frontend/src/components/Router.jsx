import React from 'react';
import { Route, Switch } from 'react-router-dom';
import WelcomePage from './welcome/WelcomePage';
import RetroListPage from './retro-list/RetroListPage';
import RetroPage from './retro/RetroPage';
import NotFound from './NotFound';

export default () => (
  <Switch>
    <Route path="/" exact component={WelcomePage} />
    <Route path="/retros" exact component={RetroListPage} />
    <Route path="/retros/:slug" exact component={RetroPage} />
    <Route component={NotFound} />
  </Switch>
);
