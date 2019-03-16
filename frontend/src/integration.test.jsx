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

function runAllEvents() {
  // Waits until no more promises are queued
  return new Promise(setImmediate);
}

describe('Application', () => {
  it('renders welcome page at root', async () => {
    const { dom } = renderApp('/');
    await runAllEvents();

    expect(dom).toContainMatchingElement('.page-welcome');
    expect(dom).not.toContainMatchingElement('.page-retro');
  });

  it('renders retro list page at /retros/', async () => {
    global.fetch.mockExpect('/api/retros')
      .andRespondJsonOk({ retros: [] });

    const { dom } = renderApp('/retros/');
    await runAllEvents();

    expect(dom).toContainMatchingElement('.page-retro-list');
  });

  it('renders retro page at /retros/id', async () => {
    const retro = makeRetro({ id: 'id-foobar', name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    const { dom } = renderApp('/retros/slug-foobar');
    await runAllEvents();

    expect(dom).toContainMatchingElement('.page-retro');
    expect(dom.find('.top-header h1')).toHaveText('Retro Name');
  });

  it('renders archive page at /retros/id/archives/id', async () => {
    const retro = makeRetro({ id: 'id-foobar', name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    global.fetch.mockExpect('/api/retros/id-foobar/archives/zigzag')
      .andRespondJsonOk(makeArchive());

    const { dom } = renderApp('/retros/slug-foobar/archives/zigzag');
    await runAllEvents();

    expect(dom).toContainMatchingElement('.page-archive');
    expect(dom.find('.top-header h1')).toIncludeText('Retro Name');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = renderApp('/nope');
    await runAllEvents();

    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
