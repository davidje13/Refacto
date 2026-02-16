import type { Retro, RetroItem } from '../shared/api-entities';
import type { AnswerID, HealthSummary } from '../shared/health';
import type { Spec } from '../api/reducer';
import { setRetroState } from './retro';

export interface HealthQuestion {
  id: string;
  enabled: boolean;
  title: string;
  good: string;
  bad: string;
}

export interface HealthRetroStateT {
  focusedItemId?: string | null;
}

export const setExpandedSection = (
  group: string | undefined,
  id: string | null,
): Spec<Retro>[] => setRetroState(group, { focusedItemId: id });

export const addHistoricSummary = (summary: HealthSummary): Spec<Retro>[] => [
  { history: ['push', summary] },
];

export const makeUserAnswerID = (questionID: string, userID: string) =>
  `${questionID}:${userID}`;

export const answerQuestion = (
  group: string | undefined,
  questionID: string,
  userID: string,
  answer: AnswerID,
  message: string,
): Spec<Retro>[] => [
  {
    items: [
      'update',
      ['first', { id: ['=', makeUserAnswerID(questionID, userID)] }],
      { category: ['=', answer], message: ['=', message] },
      {
        id: makeUserAnswerID(questionID, userID),
        group,
        category: '',
        created: Date.now(),
        votes: 0,
        doneTime: 0,
        message: '',
        attachment: null,
      },
    ],
  },
];

export function getQuestionProgress(
  questions: HealthQuestion[],
  retroItems: RetroItem[],
  userID: string,
  current: string,
) {
  const firstUnanswered = questions.findIndex(
    (q) =>
      !retroItems.some((item) => item.id === makeUserAnswerID(q.id, userID)),
  );
  const currentIndex = current
    ? questions.findIndex((q) => q.id === current)
    : firstUnanswered === -1
      ? 0
      : firstUnanswered;

  return {
    currentIndex,
    nextIndex:
      firstUnanswered !== -1 && firstUnanswered < currentIndex
        ? firstUnanswered
        : currentIndex < questions.length - 1
          ? currentIndex + 1
          : null,
  };
}

export const getAnswerCount = (retroItems: RetroItem[], questionID: string) =>
  retroItems.filter((o) => o.id.startsWith(`${questionID}:`)).length;
