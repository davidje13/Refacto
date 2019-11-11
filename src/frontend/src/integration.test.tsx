import React from 'react';
import { StaticRouter, StaticRouterContext } from 'react-router-dom';
import { HelmetProvider, FilledContext } from 'react-helmet-async';
import {
  render,
  fireEvent,
  act,
  RenderResult,
} from '@testing-library/react';
import { makeRetro } from 'refacto-entities';
import { queries, css } from './test-helpers/queries';
import { mockFetchExpect } from './test-helpers/fetch';
import { mockWsExpect } from './test-helpers/ws';

import App from './components/App';

// https://github.com/staylor/react-helmet-async/issues/61
(HelmetProvider as any).canUseDOM = false;

function extractHelmetTitle(context: FilledContext): string {
  const match = />(.*)</.exec(context.helmet.title.toString());
  return match?.[1] ?? '';
}

interface RenderedApp {
  routerContext: StaticRouterContext;
  currentTitle: () => string;
  dom: RenderResult<typeof queries>;
}

async function renderApp(location: string): Promise<RenderedApp> {
  const routerContext: StaticRouterContext = {};
  const helmetContext: FilledContext = {} as any;

  let dom: RenderResult<typeof queries>;
  await act(async () => {
    dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={location} context={routerContext}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });
  });

  return {
    routerContext,
    currentTitle: (): string => extractHelmetTitle(helmetContext),
    dom: dom!,
  };
}

describe('Application', () => {
  it('renders welcome page at root', async () => {
    const { dom, currentTitle } = await renderApp('/');

    expect(dom).toContainElementWith(css('.page-welcome'));
    expect(dom).not.toContainElementWith(css('.page-retro'));

    expect(currentTitle()).toEqual('Refacto');
  });

  it('renders retro list page at /retros', async () => {
    mockFetchExpect('/api/retros')
      .andRespondJsonOk({ retros: [] });

    const { dom } = await renderApp('/retros');

    expect(dom).toContainElementWith(css('.page-retro-list'));
  });

  it('renders retro page at /retros/id after password provided', async () => {
    const retro = makeRetro({ id: 'id-foobar', slug: 'slug-foobar', name: 'Retro Name' });

    mockFetchExpect('/api/slugs/slug-foobar')
      .andRespondJsonOk({ id: 'id-foobar' });

    mockFetchExpect('/api/auth/tokens/id-foobar')
      .andRespondJsonOk({ retroToken: 'my-token' });

    mockWsExpect('/api/retros/id-foobar', (ws: WebSocket) => {
      ws.send(JSON.stringify({ change: { $set: retro } }));
    });

    const { dom } = await renderApp('/retros/slug-foobar');

    expect(dom).toContainElementWith(css('.page-password'));
    const header1 = dom.getBy(css('.top-header h1'));
    expect(header1).toHaveTextContent('Password for slug-foobar');

    const form = dom.getBy(css('form'));
    const fieldPassword = queries.getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'anything' } });
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(dom).toContainElementWith(css('.page-retro'));
    const header2 = dom.getBy(css('.top-header h1'));
    expect(header2).toHaveTextContent('Retro Name');
  });

  it('redirects to retros url for short unknown urls', async () => {
    const { routerContext } = await renderApp('/nope');

    expect(routerContext.url).toEqual('/retros/nope');
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/foo/bar');

    expect(dom).toContainElementWith(css('.page-not-found'));
  });
});
