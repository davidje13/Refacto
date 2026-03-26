import { useMemo, type FunctionComponent } from 'react';
import type {
  RetroAuth,
  RetroHistoryItem,
  RetroItem,
} from '../../../../shared/api-entities';
import { summariseHealthVotes } from '../../../../shared/health';
import { type HealthQuestion } from '../../../../actions/healthRetro';
import { LoadingError } from '../../../common/Loader';
import { Overview } from './Overview';
import { Detail } from './Detail';

interface PropsT {
  retroId: string;
  retroSlug: string;
  retroAuth?: RetroAuth | undefined;
  questions: HealthQuestion[];
  expanded: string | null;
  retroItems: RetroItem[];
  retroHistory: RetroHistoryItem[];
  onExpand?: ((questionID: string | null) => void) | undefined;
  onBack?: (() => void) | undefined;
  onArchive?: (() => void) | undefined;
  onImport?: (() => void) | undefined;
}

export const Discussion: FunctionComponent<PropsT> = ({
  retroId,
  retroSlug,
  retroAuth,
  questions,
  expanded,
  retroItems,
  retroHistory,
  onExpand,
  onBack,
  onArchive,
  onImport,
}) => {
  const summarised = useMemo(
    () => summariseHealthVotes(retroItems),
    [retroItems],
  );

  if (!summarised) {
    return <LoadingError error="No answers" />;
  }

  const expandedQ = questions.find((q) => q.id === expanded);

  if (expandedQ) {
    return (
      <Detail
        question={expandedQ}
        summary={summarised}
        retroItems={retroItems}
        retroHistory={retroHistory}
        onClose={onExpand ? () => onExpand(null) : undefined}
      />
    );
  }

  return (
    <Overview
      retroId={retroId}
      retroSlug={retroSlug}
      retroAuth={retroAuth}
      questions={questions}
      summary={summarised}
      retroHistory={retroHistory}
      onBack={onBack}
      onExpand={onExpand}
      onArchive={onArchive}
      onImport={onImport}
    />
  );
};
