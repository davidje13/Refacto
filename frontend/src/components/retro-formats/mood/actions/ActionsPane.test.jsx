import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';
import 'jest-enzyme';

import ActionsPane from './ActionsPane';
import ActionSection from './ActionSection';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import LocalDateProvider from '../../../../time/LocalDateProvider';

jest.mock('../../../common/ExpandingTextEntry', () => () => (<div />));
jest.mock('./ActionSection', () => () => (<div />));

describe('ActionsPane', () => {
  const items = [
    makeItem({ id: '1' }),
    makeItem({ id: '2' }),
    makeItem({ id: '3' }),
  ];

  let dom;
  let sections;
  let localDateProvider;

  beforeEach(() => {
    localDateProvider = new LocalDateProvider(0);
    jest.spyOn(localDateProvider, 'getMidnightTimestamp')
      .mockImplementation((days = 0) => days * 10);

    dom = mount((
      <ActionsPane
        items={items}
        localDateProvider={localDateProvider}
      />
    ));
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

  it('does not render an input field if no callback is provided', () => {
    expect(dom.find(ExpandingTextEntry)).not.toExist();
  });

  it('renders an input field if a callback is provided', () => {
    dom = mount((
      <ActionsPane
        items={items}
        localDateProvider={localDateProvider}
        onAddItem={() => {}}
      />
    ));

    expect(dom.find(ExpandingTextEntry)).toExist();
  });
});
