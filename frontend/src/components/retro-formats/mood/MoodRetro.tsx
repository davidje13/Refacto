import React, { useCallback } from 'react';
import classNames from 'classnames';
import { RetroItem } from 'refacto-entities';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import {
  RetroSpec,
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
import OPTIONS from '../../../helpers/optionManager';
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

const addExtraTime = (duration: number): RetroSpec => setRetroState({
  focusedItemTimeout: Date.now() + duration,
});

interface PropsT {
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: {
    focusedItemId?: string | null;
    focusedItemTimeout?: number;
  };
  dispatch?: (spec: RetroSpec) => void;
  onComplete: () => void;
  archive: boolean;
}

export default ({
  retroOptions,
  retroState: {
    focusedItemId = null,
    focusedItemTimeout = 0,
  },
  retroItems,
  onComplete,
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
  const handleSetActionItemDone = useDispatchAction(dispatch, setRetroItemDone);

  const refRetroItems = useBoxed(retroItems);
  const handleSetMoodItemDone = useCallback((id, done) => {
    dispatch!(setRetroItemDone(id, done));

    const items = refRetroItems.current;
    if (onComplete && items && done) {
      const allDone = items.every((item) => (
        item.done ||
        item.id === id ||
        item.category === 'action'
      ));
      if (allDone) {
        onComplete();
      }
    }
  }, [dispatch, refRetroItems]);

  const refFocusedItemId = useBoxed(focusedItemId);
  const handleSwitchFocus = useCallback((id, markPreviousDone) => {
    const focusedId = refFocusedItemId.current;

    if (markPreviousDone && focusedId !== null && id !== focusedId) {
      dispatch!(setRetroItemDone(focusedId, true));
    }

    dispatch!(setRetroState({
      focusedItemId: id,
      focusedItemTimeout: Date.now() + (5 * 60 * 1000 + 999),
    }));
  }, [dispatch, refFocusedItemId]);

  const createMoodSection = (category: Category): React.ReactElement => (
    <MoodSection
      key={category.id}
      items={retroItems}
      addItemPlaceholder={category.placeholder}
      onAddItem={handleAddItem}
      onVote={handleUpvoteItem}
      onEdit={handleEditItem}
      onDelete={handleDeleteItem}
      onSwitchFocus={dispatch && handleSwitchFocus}
      onAddExtraTime={handleAddExtraTime}
      onSetDone={handleSetMoodItemDone}
      focusedItemId={focusedItemId}
      focusedItemTimeout={focusedItemTimeout}
      autoScroll={!singleColumn}
      categoryLabel={category.title}
      category={category.id}
    />
  );

  const actionSection = (
    <ActionsPane
      items={retroItems}
      alwaysShowEntry={OPTIONS.alwaysShowAddAction.read(retroOptions)}
      onAddItem={handleAddActionItem}
      onSetDone={handleSetActionItemDone}
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
