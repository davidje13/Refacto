import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { render, fireEvent, act } from 'react-testing-library';
import { makeRetro } from './test-helpers/dataFactories';

import App from './components/App';

HelmetProvider.canUseDOM = false;

function extractHelmetTitle(context) {
  return context.helmet.title.toString().match(/>(.*)</)[1];
}

async function renderApp(location) {
  const routerContext = {};
  const helmetContext = {};

  let wrapper;
  await act(async () => {
    wrapper = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={location} context={routerContext}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ));
  });

  return {
    routerContext,
    currentTitle: () => extractHelmetTitle(helmetContext),
    wrapper,
    dom: wrapper.container,
  };
}

describe('Application', () => {
  it('renders welcome page at root', async () => {
    const { dom, currentTitle } = await renderApp('/');

    expect(dom).toContainQuerySelector('.page-welcome');
    expect(dom).not.toContainQuerySelector('.page-retro');

    expect(currentTitle()).toEqual('Refacto');
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
    fireEvent.change(fieldPassword, { target: { value: 'anything' } });
    await act(async () => fireEvent.submit(form));

    expect(dom).toContainQuerySelector('.page-retro');
    const header2 = dom.querySelector('.top-header h1');
    expect(header2).toHaveTextContent('Retro Name');
  });

  it('redirects to retros url for short unknown urls', async () => {
    const { routerContext } = await renderApp('/nope');

    expect(routerContext.url).toEqual('/retros/nope');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/foo/bar');

    expect(dom).toContainQuerySelector('.page-not-found');
  });
});
