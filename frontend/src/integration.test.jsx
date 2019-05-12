import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { render, fireEvent } from 'react-testing-library';
import { act } from 'react-dom/test-utils';
import { makeRetro } from './test-helpers/dataFactories';

import App from './components/App';

async function renderApp(location) {
  const context = {};

  let wrapper;
  await act(async () => {
    wrapper = render((
      <HelmetProvider>
        <StaticRouter location={location} context={context}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ));
  });

  return { context, wrapper, dom: wrapper.container };
}

describe('Application', () => {
  it('renders welcome page at root', async () => {
    const { dom } = await renderApp('/');

    expect(dom).toContainQuerySelector('.page-welcome');
    expect(dom).not.toContainQuerySelector('.page-retro');
  });

  it('renders retro list page at /retros', async () => {
    global.fetch.mockExpect('/api/retros')
      .andRespondJsonOk({ retros: [] });

    const { dom } = await renderApp('/retros');

    expect(dom).toContainQuerySelector('.page-retro-list');
  });

  it('renders retro page at /retros/id after password provided', async () => {
    const retro = makeRetro({ name: 'Retro Name' });

    global.fetch.mockExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    global.fetch.mockExpect('/api/auth/tokens/id-foobar')
      .andRespondJsonOk({ retroToken: 'my-token' });

    WebSocket.expect('/api/retros/id-foobar', (ws) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    const { dom } = await renderApp('/retros/slug-foobar');

    expect(dom).toContainQuerySelector('.page-password');
    const header1 = dom.querySelector('.top-header h1');
    expect(header1).toHaveTextContent('Password for slug-foobar');

    const form = dom.querySelector('form');
    const fieldPassword = form.querySelector('input[type=password]');
    await act(async () => fireEvent.change(
      fieldPassword,
      { target: { value: 'anything' } },
    ));
    await act(async () => fireEvent.submit(form));

    expect(dom).toContainQuerySelector('.page-retro');
    const header2 = dom.querySelector('.top-header h1');
    expect(header2).toHaveTextContent('Retro Name');
  });

  it('redirects to retros url for short unknown urls', async () => {
    const { context } = await renderApp('/nope');

    expect(context.url).toEqual('/retros/nope');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/foo/bar');

    expect(dom).toContainQuerySelector('.page-not-found');
  });
});
