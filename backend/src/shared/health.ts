import type { RetroHistoryItem, RetroItem } from './api-entities';

export type AnswerID = 'good' | 'mid' | 'bad' | 'skip';

export type Counts = Record<AnswerID, number>;

export interface HealthSummary extends RetroHistoryItem {
  format: 'health';
  data: {
    questions: AnswersSummary[];
    imported?: boolean;
    [k: string]: unknown;
  };
}

interface AnswersSummary {
  id: string;
  counts: Counts;
}

export function summariseHealthVotes(
  retroItems: RetroItem[],
): HealthSummary | null {
  const answers = new Map<string, AnswersSummary>();
  let time = 0;
  let any = false;
  for (const item of retroItems) {
    if (item.category === 'action') {
      continue;
    }
    const questionID = item.id.split(':')[0]!;
    let answer = answers.get(questionID);
    if (!answer) {
      answer = { id: questionID, counts: { ...ZERO_COUNTS } };
      answers.set(questionID, answer);
    }
    if (Object.prototype.hasOwnProperty.call(answer.counts, item.category)) {
      ++answer.counts[item.category as AnswerID];
      if (item.created > time) {
        time = item.created;
      }
      any = true;
    }
  }
  if (!any) {
    return null;
  }
  return {
    time,
    format: 'health',
    data: { questions: [...answers.values()] },
  };
}

export const ZERO_COUNTS: Readonly<Counts> = {
  good: 0,
  mid: 0,
  bad: 0,
  skip: 0,
};
