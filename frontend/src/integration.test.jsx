import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { makeRetro, makeArchive } from './test-helpers/dataFactories';

import App from './components/App';

async function renderApp(location) {
  const context = {};

  let dom;
  await act(async () => {
    dom = mount((
      <HelmetProvider>
        <StaticRouter location={location} context={context}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ));
  });

  return { context, dom };
}

describe('Application', () => {
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

  // Maybe awaiting https://github.com/facebook/react/issues/15472
  it.skip('renders retro page at /retros/id after password provided', async () => {
    const retro = makeRetro({ name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    global.fetch.mockExpect('/auth/tokens/id-foobar')
      .andRespondJsonOk({ retroToken: 'my-token' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    const { dom } = await renderApp('/retros/slug-foobar');

    // TODO: asynchronous action from mounting is not handled by act();
    // DOM is not refreshed
    expect(dom).toContainMatchingElement('.page-password');
    expect(dom.find('.top-header h1')).toHaveText('Password for slug-foobar');

    // TODO: fill in password

    expect(dom).toContainMatchingElement('.page-retro');
    expect(dom.find('.top-header h1')).toHaveText('Retro Name');
  });

  // Maybe awaiting https://github.com/facebook/react/issues/15472
  it.skip('renders archive page at /retros/id/archives/id after password provided', async () => {
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

  it('redirects to retros url for short unknown urls', async () => {
    const { context } = await renderApp('/nope');

    expect(context.url).toEqual('/retros/nope');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/foo/bar');

    expect(dom).toContainMatchingElement('.page-not-found');
  });
});
