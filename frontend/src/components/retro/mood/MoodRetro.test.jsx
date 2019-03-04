import React from 'react';
import { shallow } from 'enzyme';
import { makeRetro } from '../../../test-helpers/dataFactories';

import { MoodRetro } from './MoodRetro';
import LocalDateProvider from '../../../time/LocalDateProvider';

const emptyRetro = makeRetro({ format: 'mood' });

describe('MoodRetro', () => {
  const localDateProvider = new LocalDateProvider(0);

  it('renders without error', () => {
    const dom = shallow((
      <MoodRetro
        retro={emptyRetro}
        localDateProvider={localDateProvider}
        singleColumn={false}
        onAddMoodItem={() => {}}
        onAddActionItem={() => {}}
        onVoteItem={() => {}}
        onEditItem={() => {}}
        onDeleteItem={() => {}}
        onSetItemDone={() => {}}
        onSwitchFocus={() => {}}
        onAddExtraTime={() => {}}
      />
    ));
    expect(dom).toExist();
  });
});
