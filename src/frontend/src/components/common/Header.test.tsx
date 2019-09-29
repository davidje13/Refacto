import React from 'react';
import { StaticRouter, StaticRouterContext } from 'react-router-dom';
import { HelmetProvider, FilledContext } from 'react-helmet-async';
import { render, fireEvent } from '@testing-library/react';
import { queries, css } from '../../test-helpers/queries';

import Header from './Header';

// https://github.com/staylor/react-helmet-async/issues/61
(HelmetProvider as any).canUseDOM = false;

function extractHelmetTitle(context: FilledContext): string {
  const match = />(.*)</.exec(context.helmet.title.toString());
  return match ? match[1] : '';
}

describe('Header', () => {
  it('sets the document and page title', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    expect(extractHelmetTitle(helmetContext)).toEqual('doc-title');
    expect(dom.getBy(css('h1'))).toHaveTextContent('page-title');
  });

  it('displays a back link if specified', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            backLink={{ label: 'back-label', action: 'back-url' }}
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    const backLink = dom.getBy(css('.back'));
    expect(backLink).toHaveTextContent('back-label');

    fireEvent.click(backLink);
    expect(routerContext.url).toEqual('back-url');
  });

  it('displays a menu of links if specified', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: 'url-1' },
              { label: 'label-2', action: 'url-2' },
            ]}
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    const links = dom.getAllBy(css('.menu > *'));
    expect(links.length).toEqual(2);
    expect(links[0]).toHaveTextContent('label-1');
    expect(links[1]).toHaveTextContent('label-2');
  });

  it('skips null menu items', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: 'url-1' },
              null,
              { label: 'label-2', action: 'url-2' },
            ]}
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    const links = dom.getAllBy(css('.menu > *'));
    expect(links.length).toEqual(2);
    expect(links[1]).toHaveTextContent('label-2');
  });

  it('routes to the given URL when a menu item is clicked', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: 'url-1' },
            ]}
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    const links = dom.getAllBy(css('.menu > *'));

    fireEvent.click(links[0]);
    expect(routerContext.url).toEqual('url-1');
  });

  it('invokes the given callback when a menu item is clicked', () => {
    const routerContext: StaticRouterContext = {};
    const helmetContext: FilledContext = {} as any;
    const clickCallback = jest.fn().mockName('clickCallback');

    const dom = render((
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="" context={routerContext}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: clickCallback },
            ]}
          />
        </StaticRouter>
      </HelmetProvider>
    ), { queries });

    const links = dom.getAllBy(css('.menu > *'));

    fireEvent.click(links[0]);
    expect(clickCallback).toHaveBeenCalled();
  });
});
