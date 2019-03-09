import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { makeRetro, makeArchive } from './test-helpers/dataFactories';

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
    global.fetch.mockExpect('/api/retros')
      .andRespondJsonOk({ retros: [] });

    const { dom } = renderApp('/retros/');
    expect(dom).toContainMatchingElement('.page-retro-list');
  });

  it('renders retro page at /retros/id', () => {
    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    global.fetch.mockExpect('/api/retros/id-foobar')
      .andRespondJsonOk(makeRetro({ id: 'id-foobar' }));

    const { dom } = renderApp('/retros/slug-foobar');
    expect(dom).toContainMatchingElement('.page-retro');
  });

  it('renders archive page at /retros/id/archives/id', () => {
    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    global.fetch.mockExpect('/api/retros/id-foobar')
      .andRespondJsonOk(makeRetro({ id: 'id-foobar' }));

    global.fetch.mockExpect('/api/retros/id-foobar/archives/zigzag')
      .andRespondJsonOk(makeArchive());

    const { dom } = renderApp('/retros/slug-foobar/archives/zigzag');
    expect(dom).toContainMatchingElement('.page-archive');
  });

  it('renders not found page at unknown urls', () => {
    const { dom } = renderApp('/nope');
    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
