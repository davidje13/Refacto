import React from 'react';
import classNames from 'classnames';
import { Retro, RetroItem } from 'refacto-entities';
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
import { Dispatch } from '../../../api/SharedReducer';
import useWindowSize from '../../../hooks/env/useWindowSize';
import useLocalDateProvider from '../../../hooks/env/useLocalDateProvider';
import useBoundCallback from '../../../hooks/useBoundCallback';
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

  const canFacilitate = (
    !singleColumn ||
    OPTIONS.enableMobileFacilitation.read(retroOptions)
  );

  function facilitate<T>(x: T): T | undefined {
    if (canFacilitate) {
      return x;
    }
    return undefined;
  }

  const checkAutoArchive = useBoundCallback(allItemsDoneCallback, onComplete);

  const handleAddItem = useDispatchAction(dispatch, addRetroItem);
  const handleAddActionItem = useDispatchAction(dispatch, addRetroActionItem);
  const handleUpvoteItem = useDispatchAction(dispatch, upvoteRetroItem);
  const handleEditItem = useDispatchAction(dispatch, editRetroItem);
  const handleDeleteItem = useDispatchAction(dispatch, deleteRetroItem);
  const handleAddExtraTime = useDispatchAction(dispatch, facilitate(setItemTimeout));
  const handleSwitchFocus = useDispatchAction(dispatch, facilitate(switchFocus));
  const handleSetActionItemDone = useDispatchAction(dispatch, setRetroItemDone);
  const handleSetMoodItemDone = useDispatchAction(
    dispatch,
    facilitate(setRetroItemDone),
    checkAutoArchive,
  );

  useGlobalKeyListener({
    ArrowRight: useDispatchAction(dispatch, facilitate(goNext), checkAutoArchive),
    ArrowLeft: useDispatchAction(dispatch, facilitate(goPrevious)),
    Enter: useDispatchAction(
      dispatch,
      facilitate(useBoundCallback(switchFocus, true, null)),
      checkAutoArchive,
    ),
    Escape: useDispatchAction(
      dispatch,
      facilitate(useBoundCallback(switchFocus, false, null)),
    ),
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
      onSwitchFocus={handleSwitchFocus}
      onAddExtraTime={handleAddExtraTime}
      onSetDone={handleSetMoodItemDone}
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
