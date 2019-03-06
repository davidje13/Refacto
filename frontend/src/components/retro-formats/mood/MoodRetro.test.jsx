import React from 'react';
import { shallow } from 'enzyme';
import { makeRetroData } from '../../../test-helpers/dataFactories';

import { MoodRetro } from './MoodRetro';
import LocalDateProvider from '../../../time/LocalDateProvider';

const emptyRetroData = makeRetroData({ format: 'mood' });

describe('MoodRetro', () => {
  const localDateProvider = new LocalDateProvider(0);

  it('renders without error', () => {
    const dom = shallow((
      <MoodRetro
        retroData={emptyRetroData}
        retroState={{}}
        localDateProvider={localDateProvider}
        singleColumn={false}
        archive={false}
        onAddItem={() => {}}
        onVoteItem={() => {}}
        onEditItem={() => {}}
        onDeleteItem={() => {}}
        onSetItemDone={() => {}}
        onSetRetroState={() => {}}
      />
    ));
    expect(dom).toExist();
  });
});
