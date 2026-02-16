import { useMemo, useState, type FunctionComponent } from 'react';
import type { AnswerID } from '../../../shared/health';
import { startViewTransition } from '../../../helpers/viewTransition';
import { classNames } from '../../../helpers/classNames';
import { randomUUID } from '../../../helpers/crypto';
import { useStateMap } from '../../../hooks/useStateMap';
import { useBoolean } from '../../../hooks/useBoolean';
import { useActionFactory } from '../../../hooks/useActionFactory';
import type { RetroFormatProps } from '../formats';
import {
  addHistoricSummary,
  answerQuestion,
  setExpandedSection,
  type HealthRetroStateT,
} from '../../../actions/healthRetro';
import { Intro } from './intro/Intro';
import { Questions } from './questions/Questions';
import { Discussion } from './discussion/Discussion';
import { ImportPopup } from './ImportPopup';
import { useQuestionSet } from './useQuestionSet';
import './HealthRetro.css';

type OwnState =
  | { stage: 'begin' }
  | { stage: 'answer'; user: string }
  | { stage: 'discuss' };

export const HealthRetro: FunctionComponent<
  RetroFormatProps<HealthRetroStateT>
> = ({
  className,
  retroOptions,
  retroState,
  retroItems,
  retroHistory,
  group,
  dispatch,
  onArchive,
  onInvite,
  settingsLink,
  archive,
}) => {
  const useAction = useActionFactory(dispatch);
  const surveyNumber = retroHistory.filter(
    (item) => item.format === 'health' && !item.data['imported'],
  ).length;
  const [ownState, setOwnState] = useStateMap<OwnState>(
    'health',
    `own-state-${surveyNumber}`, // change state key to force a reset when archiving
    { stage: 'begin' },
    true,
  );
  const importing = useBoolean(false);
  const [previousUser, setPreviousUser] = useState('');
  const questions = useQuestionSet(retroOptions);
  const filteredRetroItems = useMemo(
    () =>
      group
        ? retroItems.filter((item) => !item.group || item.group === group)
        : retroItems,
    [retroItems, group],
  );
  const [localExpanded, setLocalExpanded] = useState<string | null>(null);

  const onAnswer = useAction(
    (questionID: string, vote: AnswerID, message: string) =>
      answerQuestion(
        group,
        questionID,
        ownState.stage === 'answer' ? ownState.user : '',
        vote,
        message,
      ),
  );
  const onExpand = useAction((id: string | null) =>
    setExpandedSection(group, id),
  );
  const onImport = useAction(addHistoricSummary);

  if (archive) {
    return (
      <div className={classNames('retro-format-health archive', className)}>
        <Discussion
          questions={questions}
          expanded={localExpanded}
          retroItems={filteredRetroItems}
          retroHistory={retroHistory}
          onExpand={setLocalExpanded}
        />
      </div>
    );
  }

  return (
    <div className={classNames('retro-format-health', className)}>
      {ownState.stage === 'answer' && onAnswer ? (
        <Questions
          userID={ownState.user}
          questions={questions}
          retroItems={filteredRetroItems}
          settingsLink={settingsLink}
          onAnswer={onAnswer}
          onCancel={() => setOwnState({ stage: 'begin' })}
          onComplete={() => {
            setPreviousUser(ownState.user);
            setOwnState({ stage: 'begin' });
          }}
        />
      ) : ownState.stage === 'begin' && onAnswer ? (
        <Intro
          questions={questions}
          retroItems={filteredRetroItems}
          onBeginAnswering={() =>
            startViewTransition('health-next', () =>
              setOwnState({ stage: 'answer', user: randomUUID() }),
            )
          }
          onBack={
            previousUser
              ? () =>
                  startViewTransition('health-prev', () =>
                    setOwnState({ stage: 'answer', user: previousUser }),
                  )
              : undefined
          }
          onDiscuss={() => setOwnState({ stage: 'discuss' })}
          onInvite={onInvite}
        />
      ) : (
        <Discussion
          questions={questions}
          expanded={retroState.focusedItemId ?? null}
          retroItems={filteredRetroItems}
          retroHistory={retroHistory}
          onExpand={onExpand}
          onBack={onAnswer ? () => setOwnState({ stage: 'begin' }) : undefined}
          onArchive={onArchive}
          onImport={onImport ? importing.setTrue : undefined}
        />
      )}
      {onImport ? (
        <ImportPopup
          isOpen={importing.value}
          onImport={onImport}
          onClose={importing.setFalse}
          questions={questions}
          retroHistory={retroHistory}
        />
      ) : null}
    </div>
  );
};
