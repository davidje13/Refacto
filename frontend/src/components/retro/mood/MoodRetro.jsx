import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../time/LocalDateProvider';
import { addItem, voteOnItem } from '../../../reducers/activeRetro';
import './MoodRetro.less';

const CATEGORIES = [
  { id: 'happy', title: 'Happy', placeholder: 'I\u2019m glad that\u2026' },
  { id: 'meh', title: 'Meh', placeholder: 'I\u2019m wondering about\u2026' },
  { id: 'sad', title: 'Sad', placeholder: 'It wasn\u2019t so great that\u2026' },
];

export const MoodRetro = ({
  retro: {
    state: {
      focusedItemUUID = null,
    },
    items,
  },
  singleColumn,
  localDateProvider,
  onAddMoodItem,
  onAddActionItem,
  onVote,
}) => {
  const createMoodSection = (category) => (
    <MoodSection
      key={category.id}
      items={items}
      addItemPlaceholder={category.placeholder}
      onAddItem={onAddMoodItem}
      onVote={onVote}
      focusedItemUUID={focusedItemUUID}
      category={category.id}
    />
  );

  const actionSection = (
    <ActionsPane
      items={items}
      onAddItem={onAddActionItem}
      localDateProvider={localDateProvider}
    />
  );

  if (singleColumn) {
    const tabs = [
      ...CATEGORIES.map((category) => ({
        key: category.id,
        title: category.title,
        className: category.id,
        content: createMoodSection(category),
      })),
      {
        key: 'actions',
        title: 'Action',
        className: 'actions',
        content: actionSection,
      },
    ];

    return (
      <div className="retro-format-mood single-column">
        <TabControl tabs={tabs} />
      </div>
    );
  }

  return (
    <div className="retro-format-mood multi-column">
      <section className="columns">
        { CATEGORIES.map((category) => createMoodSection(category)) }
      </section>
      { actionSection }
    </div>
  );
};

MoodRetro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
  singleColumn: PropTypes.bool.isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
  onAddMoodItem: PropTypes.func.isRequired,
  onAddActionItem: PropTypes.func.isRequired,
  onVote: PropTypes.func.isRequired,
};

forbidExtraProps(MoodRetro);

const mapStateToProps = (state) => ({
  singleColumn: (state.view.windowWidth <= 800),
  localDateProvider: state.time.localDateProvider,
});

const mapDispatchToProps = {
  onAddMoodItem: addItem,
  onAddActionItem: (message) => addItem('action', message),
  onVote: voteOnItem,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MoodRetro);
