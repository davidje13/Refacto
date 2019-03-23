import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import { connect } from 'react-redux';
import classNames from 'classnames';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import useMutatedCallback from '../../../hooks/useMutatedCallback';
import useBoundCallback from '../../../hooks/useBoundCallback';
import useBoxed from '../../../hooks/useBoxed';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../time/LocalDateProvider';
import './MoodRetro.less';

const CATEGORIES = [
  { id: 'happy', title: 'Happy', placeholder: 'I\u2019m glad that\u2026' },
  { id: 'meh', title: 'Meh', placeholder: 'I\u2019m wondering about\u2026' },
  { id: 'sad', title: 'Sad', placeholder: 'It wasn\u2019t so great that\u2026' },
];

export const MoodRetro = ({
  retroState: {
    focusedItemId = null,
    focusedItemTimeout = 0,
  },
  retroData: {
    items,
  },
  singleColumn,
  localDateProvider,
  archive,
  onAddItem,
  onVoteItem,
  onEditItem,
  onDeleteItem,
  onSetItemDone,
  onSetRetroState,
}) => {
  const handleAddActionItem = useBoundCallback(onAddItem, 'action');

  const handleAddExtraTime = useMutatedCallback(
    onSetRetroState,
    (duration) => [{ focusedItemTimeout: Date.now() + duration }],
    [],
  );

  const refFocusedItemId = useBoxed(focusedItemId);
  const handleSwitchFocus = useCallback((id, markPreviousDone) => {
    const focusedId = refFocusedItemId.current;

    if (markPreviousDone && focusedId !== null && id !== focusedId) {
      onSetItemDone(focusedId, true);
    }

    onSetRetroState({
      focusedItemId: id,
      focusedItemTimeout: Date.now() + (5 * 60 * 1000 + 999),
    });
  }, [onSetRetroState, onSetItemDone, refFocusedItemId]);

  const createMoodSection = (category) => (
    <MoodSection
      key={category.id}
      items={items}
      addItemPlaceholder={category.placeholder}
      onAddItem={onAddItem}
      onVote={onVoteItem}
      onEdit={onEditItem}
      onDelete={onDeleteItem}
      onSwitchFocus={onSetRetroState && handleSwitchFocus}
      onAddExtraTime={handleAddExtraTime}
      onSetDone={onSetItemDone}
      focusedItemId={focusedItemId}
      focusedItemTimeout={focusedItemTimeout}
      category={category.id}
    />
  );

  const actionSection = (
    <ActionsPane
      items={items}
      onAddItem={handleAddActionItem}
      onSetDone={onSetItemDone}
      onEdit={onEditItem}
      onDelete={onDeleteItem}
      localDateProvider={localDateProvider}
    />
  );

  const hasFocused = (focusedItemId !== null);

  const baseClassName = classNames(
    'retro-format-mood',
    singleColumn ? 'single-column' : 'multi-column',
    { 'has-focused': hasFocused, archive },
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
      <div className={baseClassName}>
        <TabControl tabs={tabs} />
      </div>
    );
  }

  return (
    <div className={baseClassName}>
      <section className="columns">
        { CATEGORIES.map((category) => createMoodSection(category)) }
      </section>
      { actionSection }
    </div>
  );
};

MoodRetro.propTypes = {
  retroState: PropTypes.shape({
    focusedItemId: PropTypes.string,
    focusedItemTimeout: PropTypes.number,
  }).isRequired,
  retroData: propTypesShapeRetroData.isRequired,
  singleColumn: PropTypes.bool.isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
  archive: PropTypes.bool.isRequired,
  onAddItem: nullable(PropTypes.func).isRequired,
  onVoteItem: nullable(PropTypes.func).isRequired,
  onEditItem: nullable(PropTypes.func).isRequired,
  onDeleteItem: nullable(PropTypes.func).isRequired,
  onSetItemDone: nullable(PropTypes.func).isRequired,
  onSetRetroState: nullable(PropTypes.func).isRequired,
};

forbidExtraProps(MoodRetro);

const mapStateToProps = (state) => ({
  singleColumn: (state.view.windowWidth <= 800),
  localDateProvider: state.time.localDateProvider,
});

export default connect(mapStateToProps, () => ({}))(MoodRetro);
