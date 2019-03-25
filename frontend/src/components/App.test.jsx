import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';

import App from './App';

describe('App', () => {
  it('renders without error', () => {
    const dom = mount((
      <HelmetProvider>
        <StaticRouter location="/" context={{}}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ));

    expect(dom).toExist();
  });
});
