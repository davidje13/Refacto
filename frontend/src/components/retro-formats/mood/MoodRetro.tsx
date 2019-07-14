import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import { Spec } from 'json-immutability-helper';
import classNames from 'classnames';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import {
  setRetroState,
  addRetroItem,
  editRetroItem,
  setRetroItemDone,
  upvoteRetroItem,
  deleteRetroItem,
} from '../../../actions/retro';
import useBoxed from '../../../hooks/useBoxed';
import useWindowSize from '../../../hooks/env/useWindowSize';
import useLocalDateProvider from '../../../hooks/env/useLocalDateProvider';
import useDispatchAction from '../../../hooks/useDispatchAction';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../../api/dataStructurePropTypes';
import './MoodRetro.less';

interface Category {
  id: string;
  title: string;
  placeholder: string;
}

const CATEGORIES: Category[] = [
  { id: 'happy', title: 'Happy', placeholder: 'I\u2019m glad that\u2026' },
  { id: 'meh', title: 'Meh', placeholder: 'I\u2019m wondering about\u2026' },
  { id: 'sad', title: 'Sad', placeholder: 'It wasn\u2019t so great that\u2026' },
];

const addRetroActionItem = addRetroItem.bind(null, 'action');

const addExtraTime = (duration: number): Spec<any> => setRetroState({ // TODO
  focusedItemTimeout: Date.now() + duration,
});

interface PropsT {
  retroState: {
    focusedItemId?: string | null;
    focusedItemTimeout?: number;
  };
  retroData: {
    items: any[];
  };
  onComplete: () => void;
  dispatch: (spec: Spec<any>) => void; // TODO
  archive: () => void;
}

const MoodRetro = ({
  retroState: {
    focusedItemId = null,
    focusedItemTimeout = 0,
  },
  retroData: {
    items,
  },
  onComplete, /* eslint-disable-line @typescript-eslint/no-unused-vars */ // TODO
  dispatch,
  archive,
}: PropsT): React.ReactElement => {
  const singleColumn = useWindowSize(({ width }) => (width <= 800), []);
  const localDateProvider = useLocalDateProvider();

  const handleAddItem = useDispatchAction(dispatch, addRetroItem);
  const handleAddActionItem = useDispatchAction(dispatch, addRetroActionItem);
  const handleUpvoteItem = useDispatchAction(dispatch, upvoteRetroItem);
  const handleEditItem = useDispatchAction(dispatch, editRetroItem);
  const handleDeleteItem = useDispatchAction(dispatch, deleteRetroItem);
  const handleAddExtraTime = useDispatchAction(dispatch, addExtraTime);
  const handleSetItemDone = useDispatchAction(dispatch, setRetroItemDone);

  const refFocusedItemId = useBoxed(focusedItemId);
  const handleSwitchFocus = useCallback((id, markPreviousDone) => {
    const focusedId = refFocusedItemId.current;

    if (markPreviousDone && focusedId !== null && id !== focusedId) {
      dispatch(setRetroItemDone(focusedId, true));
    }

    dispatch(setRetroState({
      focusedItemId: id,
      focusedItemTimeout: Date.now() + (5 * 60 * 1000 + 999),
    }));
  }, [dispatch, refFocusedItemId]);

  const createMoodSection = (category: Category): React.ReactElement => (
    <MoodSection
      key={category.id}
      items={items}
      addItemPlaceholder={category.placeholder}
      onAddItem={handleAddItem}
      onVote={handleUpvoteItem}
      onEdit={handleEditItem}
      onDelete={handleDeleteItem}
      onSwitchFocus={dispatch && handleSwitchFocus}
      onAddExtraTime={handleAddExtraTime}
      onSetDone={handleSetItemDone}
      focusedItemId={focusedItemId}
      focusedItemTimeout={focusedItemTimeout}
      categoryLabel={category.title}
      category={category.id}
    />
  );

  const actionSection = (
    <ActionsPane
      items={items}
      onAddItem={handleAddActionItem}
      onSetDone={handleSetItemDone}
      onEdit={handleEditItem}
      onDelete={handleDeleteItem}
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
  dispatch: nullable(PropTypes.func).isRequired,
  onComplete: PropTypes.func.isRequired,
  archive: PropTypes.bool.isRequired,
};

forbidExtraProps(MoodRetro);

export default MoodRetro;
