import React from 'react';
import classNames from 'classnames';
import type { RetroItem } from '../../../shared/api-entities';
import MoodSection from './categories/MoodSection';
import ActionsPane from './actions/ActionsPane';
import TabControl from '../../common/TabControl';
import type { RetroDispatch } from '../../../api/RetroTracker';
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
import useWindowSize from '../../../hooks/env/useWindowSize';
import useLocalDateProvider from '../../../hooks/env/useLocalDateProvider';
import useBoundCallback from '../../../hooks/useBoundCallback';
import useActionFactory from '../../../hooks/useActionFactory';
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
  group?: string;
  dispatch?: RetroDispatch;
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
  group,
  dispatch,
  onComplete,
  archive,
  archiveTime,
}: PropsT): React.ReactElement => {
  const singleColumn = useWindowSize(({ width }) => (width <= 800), []);
  const localDateProvider = useLocalDateProvider(archiveTime);

  const canFacilitate = (
    !singleColumn ||
    OPTIONS.enableMobileFacilitation.read(retroOptions)
  );

  const useAction = useActionFactory(dispatch);
  const useFacilitatorAction = useActionFactory(dispatch, canFacilitate);

  const checkAutoArchive = useBoundCallback(allItemsDoneCallback, onComplete);

  const handleAddItem = useAction(addRetroItem);
  const handleAddActionItem = useAction(addRetroActionItem);
  const handleUpvoteItem = useAction(upvoteRetroItem);
  const handleEditItem = useAction(editRetroItem);
  const handleDeleteItem = useAction(deleteRetroItem);
  const handleAddExtraTime = useFacilitatorAction(useBoundCallback(setItemTimeout, group));
  const handleSelectItem = useFacilitatorAction(useBoundCallback(switchFocus, group, true));
  const handleSetActionItemDone = useAction(setRetroItemDone);
  const handleGoNext = useFacilitatorAction(useBoundCallback(goNext, group), checkAutoArchive);
  const handleGoPrevious = useFacilitatorAction(useBoundCallback(goPrevious, group));

  useGlobalKeyListener({
    ArrowRight: handleGoNext,
    ArrowLeft: handleGoPrevious,
    Enter: useFacilitatorAction(useBoundCallback(switchFocus, group, true, null), checkAutoArchive),
    Escape: useFacilitatorAction(useBoundCallback(switchFocus, group, false, null)),
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
      group={group}
      theme={OPTIONS.theme.read(retroOptions)}
    />
  );

  const actionSection = (
    <ActionsPane
      items={retroItems}
      group={group}
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
