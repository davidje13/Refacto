import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import store from './reducers/store';
import App from './components/App';

function renderApp(location) {
  const context = {};

  const dom = mount((
    <HelmetProvider>
      <Provider store={store}>
        <StaticRouter location={location} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </HelmetProvider>
  ));

  return { context, dom };
}

describe('Application', () => {
  it('renders welcome page at root', () => {
    const { dom } = renderApp('/');
    expect(dom).toContainMatchingElement('.page-welcome');
    expect(dom).not.toContainMatchingElement('.page-retro');
  });

  it('renders retro list page at /retros/', () => {
    const { dom } = renderApp('/retros/');
    expect(dom).toContainMatchingElement('.page-retro-list');
  });

  it('renders retro page at /retros/id', () => {
    const { dom } = renderApp('/retros/foobar');
    expect(dom).toContainMatchingElement('.page-retro');
  });

  it('renders archive page at /retros/id/archives/id', () => {
    const { dom } = renderApp('/retros/foobar/archives/zigzag');
    expect(dom).toContainMatchingElement('.page-archive');
  });

  it('renders not found page at unknown urls', () => {
    const { dom } = renderApp('/nope');
    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
