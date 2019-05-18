import React from 'react';
import { render } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';
import mockElement from '../../../../test-helpers/mockElement';
import mockPropStorage from '../../../../test-helpers/mockPropStorage';

import ActionsPane from './ActionsPane';
import LocalDateProvider from '../../../../time/LocalDateProvider';

jest.mock('../../../common/ExpandingTextEntry', () => mockElement('fake-expanding-text-entry'));
jest.mock('./ActionSection', () => mockElement('fake-action-section'));

describe('ActionsPane', () => {
  const items = [
    makeItem({ id: '1' }),
    makeItem({ id: '2' }),
    makeItem({ id: '3' }),
  ];

  let rendered;
  let sections;
  let localDateProvider;

  beforeEach(() => {
    localDateProvider = new LocalDateProvider(0);
    jest.spyOn(localDateProvider, 'getMidnightTimestamp')
      .mockImplementation((days = 0) => days * 10);

    rendered = render((
      <ActionsPane
        items={items}
        localDateProvider={localDateProvider}
      />
    ));
    sections = rendered.container.querySelectorAll('fake-action-section');
  });

  it('creates a section for today', () => {
    const today = sections[0];

    expect(mockPropStorage.get(today).title).toContain('Today');
    expect(today).toHaveMockProps({
      items,
      rangeFrom: 0,
    });
  });

  it('creates a section for the past week', () => {
    const week = sections[1];

    expect(mockPropStorage.get(week).title).toContain('Past Week');
    expect(week).toHaveMockProps({
      items,
      rangeFrom: -70,
      rangeTo: 0,
    });
  });

  it('creates a section for older items', () => {
    const older = sections[2];

    expect(mockPropStorage.get(older).title).toContain('Older');
    expect(older).toHaveMockProps({
      items,
      rangeTo: -70,
    });
  });

  it('does not render an input field if no callback is provided', () => {
    expect(rendered.container)
      .not.toContainQuerySelector('fake-expanding-text-entry');
  });

  it('renders an input field if a callback is provided', () => {
    rendered = render((
      <ActionsPane
        items={items}
        localDateProvider={localDateProvider}
        onAddItem={() => {}}
      />
    ));

    expect(rendered.container)
      .toContainQuerySelector('fake-expanding-text-entry');
  });
});
