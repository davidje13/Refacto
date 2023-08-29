import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render, fireEvent } from 'flexible-testing-library-react';
import staticTitleHook from '../../test-helpers/staticTitleHook';
import { css } from '../../test-helpers/queries';
import { TitleContext } from '../../hooks/env/useTitle';

import Header from './Header';

describe('Header', () => {
  it('sets the document and page title', () => {
    const titleHook = staticTitleHook();

    const dom = render(
      <TitleContext value={titleHook}>
        <Router hook={staticLocationHook('/', { record: true })}>
          <Header documentTitle="doc-title" title="page-title" />
        </Router>
      </TitleContext>,
    );

    expect(titleHook.currentTitle).toEqual('doc-title');
    expect(dom.getBy(css('h1'))).toHaveTextContent('page-title');
  });

  it('displays a back link if specified', () => {
    const locationHook = staticLocationHook('/', { record: true });

    const dom = render(
      <TitleContext value={staticTitleHook()}>
        <Router hook={locationHook}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            backLink={{ label: 'back-label', action: 'back-url' }}
          />
        </Router>
      </TitleContext>,
    );

    const backLink = dom.getBy(css('.back'));
    expect(backLink).toHaveTextContent('back-label');

    fireEvent.click(backLink);
    expect(locationHook.history).toEqual(['/', 'back-url']);
  });

  it('displays a menu of links if specified', () => {
    const dom = render(
      <TitleContext value={staticTitleHook()}>
        <Router hook={staticLocationHook('/', { record: true })}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: 'url-1' },
              { label: 'label-2', action: 'url-2' },
            ]}
          />
        </Router>
      </TitleContext>,
    );

    const links = dom.getAllBy(css('.menu > *'));
    expect(links.length).toEqual(2);
    expect(links[0]).toHaveTextContent('label-1');
    expect(links[1]).toHaveTextContent('label-2');
  });

  it('skips null menu items', () => {
    const dom = render(
      <TitleContext value={staticTitleHook()}>
        <Router hook={staticLocationHook('/', { record: true })}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[
              { label: 'label-1', action: 'url-1' },
              null,
              { label: 'label-2', action: 'url-2' },
            ]}
          />
        </Router>
      </TitleContext>,
    );

    const links = dom.getAllBy(css('.menu > *'));
    expect(links.length).toEqual(2);
    expect(links[1]).toHaveTextContent('label-2');
  });

  it('routes to the given URL when a menu item is clicked', () => {
    const locationHook = staticLocationHook('/', { record: true });

    const dom = render(
      <TitleContext value={staticTitleHook()}>
        <Router hook={locationHook}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[{ label: 'label-1', action: 'url-1' }]}
          />
        </Router>
      </TitleContext>,
    );

    const links = dom.getAllBy(css('.menu > *'));

    fireEvent.click(links[0]!);
    expect(locationHook.history).toEqual(['/', 'url-1']);
  });

  it('invokes the given callback when a menu item is clicked', () => {
    const clickCallback = jest.fn().mockName('clickCallback');

    const dom = render(
      <TitleContext value={staticTitleHook()}>
        <Router hook={staticLocationHook('/', { record: true })}>
          <Header
            documentTitle="doc-title"
            title="page-title"
            links={[{ label: 'label-1', action: clickCallback }]}
          />
        </Router>
      </TitleContext>,
    );

    const links = dom.getAllBy(css('.menu > *'));

    fireEvent.click(links[0]!);
    expect(clickCallback).toHaveBeenCalled();
  });
});
