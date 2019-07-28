import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  it('renders without error', () => {
    render((
      <HelmetProvider>
        <StaticRouter location="/" context={{}}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ));
  });
});
