import { useMemo } from 'react';
import type { RetroHistoryItem } from '../../../../shared/api-entities';
import {
  ZERO_COUNTS,
  type Counts,
  type HealthSummary,
} from '../../../../shared/health';
import type { Sample } from '../common/Trendline';

export const useHealthSamples = (
  summary: HealthSummary,
  history: RetroHistoryItem[],
  questionID: string,
) =>
  useMemo(() => {
    const samples: Sample[] = [];
    let previous: { counts: Counts; time: number } | null = null;
    for (const item of history) {
      if (item.format === 'health') {
        const counts = getAnswerCounts(item, questionID);
        if (counts) {
          samples.push(calcStats(item.time, counts));
          if (
            (!previous || item.time > previous.time) &&
            item.time < summary.time
          ) {
            previous = { time: item.time, counts };
          }
        }
      }
    }
    const counts = getAnswerCounts(summary, questionID) ?? ZERO_COUNTS;
    samples.push(calcStats(summary.time, counts));
    samples.sort((a, b) => a.time - b.time);
    return { counts, previous, samples };
  }, [summary, history, questionID]);

function getAnswerCounts(
  summary: RetroHistoryItem,
  id: string,
): Readonly<Counts> | null {
  const questions = summary.data['questions'];
  if (summary.format === 'health' && Array.isArray(questions)) {
    const item = questions.find(
      (q) => q && typeof q === 'object' && q.id === id,
    );
    if (item?.counts && typeof item.counts === 'object') {
      return item.counts;
    }
  }
  return null;
}

function calcStats(time: number, counts: Readonly<Counts>): Sample {
  const total = counts.good + counts.mid + counts.bad;
  if (!total) {
    return { time: time, avg: 0, sd: 10 };
  }
  const avg = (counts.good - counts.bad) / total;
  const avg2 = (counts.good + counts.bad) / total;
  return {
    time: time,
    avg: avg,
    sd: Math.sqrt(avg2 - avg * avg), // standard deviation for closed set
  };
}
