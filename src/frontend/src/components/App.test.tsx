import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  it('renders without error', () => {
    render((
      <HelmetProvider>
        <Router hook={staticLocationHook('/')}>
          <App />
        </Router>
      </HelmetProvider>
    ));
  });
});
