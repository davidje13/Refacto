import { useState, type ReactElement } from 'react';
import { classNames } from '../../../helpers/classNames';
import type { RetroItem } from '../../../shared/api-entities';
import { TabControl } from '../../common/TabControl';
import type { RetroDispatch } from '../../../api/RetroTracker';
import {
  addRetroItem,
  editRetroItem,
  setRetroItemDone,
  upvoteRetroItem,
  deleteRetroItem,
} from '../../../actions/retro';
import {
  type MoodRetroStateT,
  allItemsDoneCallback,
  goNext,
  goPrevious,
  switchFocus,
  setItemTimeout,
  addRetroActionItem,
  moodItem,
  actionItemWithinRange,
} from '../../../actions/moodRetro';
import { useWindowSize, type Size } from '../../../hooks/env/useWindowSize';
import { useLocalDateProvider } from '../../../hooks/env/useLocalDateProvider';
import { useActionFactory } from '../../../hooks/useActionFactory';
import { useGlobalKeyListener } from '../../../hooks/useGlobalKeyListener';
import { useGate } from '../../../hooks/useGate';
import { OPTIONS } from '../../../helpers/optionManager';
import { MoodSection } from './categories/MoodSection';
import { ActionsPane } from './actions/ActionsPane';
import { ActionToast } from './actions/ActionToast';
import { BeginDiscussionPopup } from './BeginDiscussionPopup';
import './MoodRetro.css';

interface Category {
  id: string;
  title: string;
  placeholder: string;
}

const CATEGORIES: Category[] = [
  { id: 'happy', title: 'Happy', placeholder: 'I\u2019m glad that\u2026' },
  { id: 'meh', title: 'Meh', placeholder: 'I\u2019m wondering about\u2026' },
  {
    id: 'sad',
    title: 'Sad',
    placeholder: 'It wasn\u2019t so great that\u2026',
  },
];

interface PropsT {
  className?: string;
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: MoodRetroStateT;
  group?: string | undefined;
  dispatch?: RetroDispatch | undefined;
  onComplete?: (() => void) | undefined;
  archive: boolean;
  archiveTime?: number;
}

const isSmallScreen = ({ width }: Size) => width <= 800;

// Some users click 'next' then select another item to discuss (ignoring the auto facilitated suggestion)
// So we provide a grace period after auto-advancing, where manually selecting another item will not cause the auto-facilitated item to be marked as done.
const ADVANCE_GRACE_PERIOD = 2000;
const NEVER = Number.NEGATIVE_INFINITY;

export const MoodRetro = ({
  className,
  retroOptions,
  retroState: { focusedItemId = null, focusedItemTimeout = 0 },
  retroItems,
  group,
  dispatch,
  onComplete,
  archive,
  archiveTime,
}: PropsT): ReactElement => {
  const singleColumn = useWindowSize(isSmallScreen);
  const localDateProvider = useLocalDateProvider(archiveTime);

  const canFacilitate =
    !singleColumn || OPTIONS.enableMobileFacilitation.read(retroOptions);

  const [autoAdvanceTime, setAutoAdvanceTime] = useState(NEVER);

  const useAction = useActionFactory(dispatch);
  const useFacilitatorAction = useActionFactory(
    canFacilitate ? dispatch : undefined,
  );
  const start = useGate(
    () => focusedItemId !== null || isAnyItemDone(retroItems, group),
  );

  const handleAddItem = useAction(addRetroItem);
  const handleAddActionItem = useAction(addRetroActionItem);
  const handleUpvoteItem = useAction(upvoteRetroItem);
  const handleEditItem = useAction(editRetroItem);
  const handleDeleteItem = useAction(deleteRetroItem);
  const handleSetActionItemDone = useAction(setRetroItemDone);

  const handleAddExtraTime = useFacilitatorAction((duration: number) =>
    setItemTimeout(group, duration),
  );

  const handleSelectItem = start.useGated(
    useFacilitatorAction((id: string) => {
      const setCurrentDone =
        Date.now() > autoAdvanceTime + ADVANCE_GRACE_PERIOD;
      setAutoAdvanceTime(NEVER);
      return switchFocus(group, () => id, { setCurrentDone });
    }),
  );
  const handleGoNext = start.useGated(
    useFacilitatorAction((id?: string) => {
      setAutoAdvanceTime(Date.now());
      return [...goNext(group, id), ...allItemsDoneCallback(onComplete)];
    }),
  );
  const handleClose = useFacilitatorAction((id?: string) => [
    ...switchFocus(group, () => null, {
      expectCurrentId: id,
      setCurrentDone: true,
    }),
    ...allItemsDoneCallback(onComplete),
  ]);
  const handleGoPrevious = useFacilitatorAction((id?: string) => {
    setAutoAdvanceTime(NEVER);
    return goPrevious(group, id);
  });
  const handleCancel = useFacilitatorAction((id?: string) =>
    switchFocus(group, () => null, { expectCurrentId: id }),
  );

  useGlobalKeyListener({
    ArrowRight: handleGoNext,
    ArrowLeft: handleGoPrevious,
    Enter: handleClose,
    Escape: handleCancel,
  });

  const createMoodSection = (category: Category): ReactElement => (
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
      onClose={handleClose}
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

  const hasFocused = focusedItemId !== null;

  const baseClassName = classNames(
    'retro-format-mood',
    className,
    singleColumn ? 'single-column' : 'multi-column',
    { 'has-focused': hasFocused, archive },
  );

  const popup = (
    <BeginDiscussionPopup
      isOpen={start.pending}
      hasPastActions={hasPastActions(
        retroItems,
        group,
        localDateProvider.getMidnightTimestamp(),
      )}
      onConfirm={start.accept}
      onClose={start.reject}
    />
  );

  const actionToast = archive ? null : (
    <ActionToast group={group} items={retroItems} />
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
        {actionToast}
        {popup}
      </div>
    );
  }

  return (
    <div className={baseClassName}>
      <section className="columns">
        {CATEGORIES.map((category) => createMoodSection(category))}
      </section>
      {actionSection}
      {actionToast}
      {popup}
    </div>
  );
};

const isAnyItemDone = (retroItems: RetroItem[], group: string | undefined) =>
  retroItems.filter(moodItem(group)).some((item) => item.doneTime !== 0);

const hasPastActions = (
  retroItems: RetroItem[],
  group: string | undefined,
  before: number,
) =>
  retroItems
    .filter(actionItemWithinRange(group, Number.NEGATIVE_INFINITY, before))
    .some((item) => item.doneTime === 0);
