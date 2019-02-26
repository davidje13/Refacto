import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { ActionsPane } from './ActionsPane';
import ActionSection from './ActionSection';
import LocalDateProvider from '../../../../time/LocalDateProvider';

describe('ActionsPane', () => {
  const items = [makeItem(), makeItem(), makeItem()];

  let dom;
  let sections;
  let localDateProvider;

  beforeEach(() => {
    localDateProvider = new LocalDateProvider(0);
    jest.spyOn(localDateProvider, 'getMidnightTimestamp')
      .mockImplementation((days = 0) => days * 10);

    dom = shallow(<ActionsPane items={items} localDateProvider={localDateProvider} />);
    sections = dom.find(ActionSection);
  });

  it('creates a section for today', () => {
    const today = sections.at(0);

    expect(today.props().title).toContain('Today');
    expect(today).toHaveProp({
      items,
      rangeFrom: 0,
    });
  });

  it('creates a section for the past week', () => {
    const week = sections.at(1);

    expect(week.props().title).toContain('Past Week');
    expect(week).toHaveProp({
      items,
      rangeFrom: -70,
      rangeTo: 0,
    });
  });

  it('creates a section for older items', () => {
    const older = sections.at(2);

    expect(older.props().title).toContain('Older');
    expect(older).toHaveProp({
      items,
      rangeTo: -70,
    });
  });
});
