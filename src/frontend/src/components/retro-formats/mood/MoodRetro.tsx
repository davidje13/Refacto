import React from 'react';
import classNames from 'classnames';
import type { Retro, RetroItem } from 'refacto-entities';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import {
  addRetroItem,
  editRetroItem,
  setRetroItemDone,
  upvoteRetroItem,
  deleteRetroItem,
} from '../../../actions/retro';
import {
  MoodRetroStateT,
  allItemsDoneCallback,
  goNext,
  goPrevious,
  switchFocus,
  setItemTimeout,
  addRetroActionItem,
} from '../../../actions/moodRetro';
import type { Dispatch } from '../../../api/SharedReducer';
import useWindowSize from '../../../hooks/env/useWindowSize';
import useLocalDateProvider from '../../../hooks/env/useLocalDateProvider';
import useBoundCallback, { useConditionalBoundCallback } from '../../../hooks/useBoundCallback';
import useDispatchAction from '../../../hooks/useDispatchAction';
import useGlobalKeyListener from '../../../hooks/useGlobalKeyListener';
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

interface PropsT {
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: MoodRetroStateT;
  dispatch?: Dispatch<Retro>;
  onComplete?: () => void;
  archive: boolean;
  archiveTime?: number;
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
  archiveTime,
}: PropsT): React.ReactElement => {
  const singleColumn = useWindowSize(({ width }) => (width <= 800), []);
  const localDateProvider = useLocalDateProvider(archiveTime);

  const canFacilitate = (
    !singleColumn ||
    OPTIONS.enableMobileFacilitation.read(retroOptions)
  );

  const facilitate = useConditionalBoundCallback(canFacilitate);

  const checkAutoArchive = useBoundCallback(allItemsDoneCallback, onComplete);

  const handleAddItem = useDispatchAction(dispatch, addRetroItem);
  const handleAddActionItem = useDispatchAction(dispatch, addRetroActionItem);
  const handleUpvoteItem = useDispatchAction(dispatch, upvoteRetroItem);
  const handleEditItem = useDispatchAction(dispatch, editRetroItem);
  const handleDeleteItem = useDispatchAction(dispatch, deleteRetroItem);
  const handleAddExtraTime = useDispatchAction(dispatch, facilitate(setItemTimeout));
  const handleSelectItem = useDispatchAction(dispatch, facilitate(switchFocus, true));
  const handleSetActionItemDone = useDispatchAction(dispatch, setRetroItemDone);
  const handleGoNext = useDispatchAction(dispatch, facilitate(goNext), checkAutoArchive);
  const handleGoPrevious = useDispatchAction(dispatch, facilitate(goPrevious));

  useGlobalKeyListener({
    ArrowRight: handleGoNext,
    ArrowLeft: handleGoPrevious,
    Enter: useDispatchAction(
      dispatch,
      facilitate(switchFocus, true, null),
      checkAutoArchive,
    ),
    Escape: useDispatchAction(dispatch, facilitate(switchFocus, false, null)),
  });

  const createMoodSection = (category: Category): React.ReactElement => (
    <MoodSection
      key={category.id}
      items={retroItems}
      addItemPlaceholder={category.placeholder}
      onAddItem={handleAddItem}
      onVote={handleUpvoteItem}
      onEdit={handleEditItem}
      onDelete={handleDeleteItem}
      onSelect={handleSelectItem}
      onCancel={handleGoPrevious}
      onContinue={handleGoNext}
      onAddExtraTime={handleAddExtraTime}
      focusedItemId={focusedItemId}
      focusedItemTimeout={focusedItemTimeout}
      autoScroll={!singleColumn}
      categoryLabel={category.title}
      category={category.id}
      theme={OPTIONS.theme.read(retroOptions)}
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
