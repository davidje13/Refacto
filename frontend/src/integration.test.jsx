import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { makeRetro, makeArchive } from './test-helpers/dataFactories';

import App from './components/App';

async function runAllEvents() {
  // Waits until no more promises are queued
  return new Promise(setImmediate);
}

async function renderApp(location) {
  const context = {};

  const dom = mount((
    <HelmetProvider>
      <StaticRouter location={location} context={context}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  ));

  await act(runAllEvents);
  return { context, dom };
}

// TODO: disabled awaiting resolution of
// https://github.com/facebook/react/issues/14769
// see https://github.com/kentcdodds/react-testing-library/issues/281
// see https://github.com/facebook/react/pull/14853

describe.skip('Application', () => {
  it('renders welcome page at root', async () => {
    const { dom } = await renderApp('/');

    expect(dom).toContainMatchingElement('.page-welcome');
    expect(dom).not.toContainMatchingElement('.page-retro');
  });

  it('renders retro list page at /retros', async () => {
    global.fetch.mockExpect('/api/retros')
      .andRespondJsonOk({ retros: [] });

    const { dom } = await renderApp('/retros');

    expect(dom).toContainMatchingElement('.page-retro-list');
  });

  it('renders retro page at /retros/id', async () => {
    const retro = makeRetro({ name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    const { dom } = await renderApp('/retros/slug-foobar');

    expect(dom).toContainMatchingElement('.page-retro');
    expect(dom.find('.top-header h1')).toHaveText('Retro Name');
  });

  it('renders archive page at /retros/id/archives/id', async () => {
    const retro = makeRetro({ name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    global.fetch.mockExpect('/api/retros/id-foobar/archives/zigzag')
      .andRespondJsonOk(makeArchive());

    const { dom } = await renderApp('/retros/slug-foobar/archives/zigzag');

    expect(dom).toContainMatchingElement('.page-archive');
    expect(dom.find('.top-header h1')).toIncludeText('Retro Name');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/nope');

    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
