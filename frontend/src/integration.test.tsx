import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import {
  render,
  fireEvent,
  act,
  RenderResult,
  getBy,
} from 'flexible-testing-library-react';
import { makeRetro } from './shared/api-entities';
import {
  staticTitleHook,
  StaticTitleHook,
} from './test-helpers/staticTitleHook';
import { css } from './test-helpers/queries';
import { mockFetchExpect } from './test-helpers/fetch';
import { mockWsExpect } from './test-helpers/ws';
import { TitleContext } from './hooks/env/useTitle';
import { userTokenTracker } from './api/api';

import { App } from './components/App';

interface RenderedApp {
  locationHook: ReturnType<typeof staticLocationHook>;
  titleHook: StaticTitleHook;
  dom: RenderResult;
}

async function renderApp(location: string): Promise<RenderedApp> {
  const locationHook = staticLocationHook(location, { record: true });
  const titleHook = staticTitleHook();

  let dom: RenderResult = null as any;
  await act(async () => {
    dom = render(
      <TitleContext value={titleHook}>
        <Router hook={locationHook}>
          <App />
        </Router>
      </TitleContext>,
    );
  });

  return { locationHook, titleHook, dom };
}

describe('Application', () => {
  beforeEach(() => {
    userTokenTracker.set('');
  });

  it('renders welcome page at root', async () => {
    const { dom, titleHook } = await renderApp('/');

    expect(dom).toContainElementWith(css('.page-welcome'));
    expect(dom).not.toContainElementWith(css('.page-retro'));

    expect(titleHook.currentTitle).toEqual('Refacto');
  });

  it('renders retro list page at root when logged in', async () => {
    userTokenTracker.set('foobar');
    mockFetchExpect('/api/retros').andRespondJsonOk({ retros: [] });

    const { dom } = await renderApp('/');

    expect(dom).toContainElementWith(css('.page-retro-list'));
  });

  it('renders retro page at /retros/id after password provided', async () => {
    jest.spyOn(console, 'info').mockReturnValue();
    const retro = makeRetro({
      id: 'id-foobar',
      slug: 'slug-foobar',
      name: 'Retro Name',
    });

    mockFetchExpect('/api/slugs/slug-foobar').andRespondJsonOk({
      id: 'id-foobar',
    });

    mockFetchExpect('/api/auth/tokens/id-foobar').andRespondJsonOk({
      retroToken: 'my-token',
    });

    mockWsExpect('/api/retros/id-foobar', async (ws) => {
      await ws.expect('my-token');
      ws.send(JSON.stringify({ init: retro }));
      await ws.waitForClose();
    });

    const { dom } = await renderApp('/retros/slug-foobar');

    expect(dom).toContainElementWith(css('.page-password'));
    const header1 = dom.getBy(css('.top-header h1'));
    expect(header1).toHaveTextContent('Password for slug-foobar');

    const form = dom.getBy(css('form'));
    const fieldPassword = getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'anything' } });
    fireEvent.submit(form);
    await act(() => Promise.resolve()); // password -> checking, then checking -> retro

    expect(dom).toContainElementWith(css('.page-retro'));
    const header2 = dom.getBy(css('.top-header h1'));
    expect(header2).toHaveTextContent('Retro Name');
    expect(console.info).toHaveBeenCalledTimes(1); // connected message
  });

  it('redirects to retros url for short unknown urls', async () => {
    const { locationHook } = await renderApp('/nope');

    expect(locationHook.history).toEqual(['/retros/nope']);
  });

  it('renders not found page at unknown urls', async () => {
    const { dom } = await renderApp('/foo/bar');

    expect(dom).toContainElementWith(css('.page-not-found'));
  });
});
