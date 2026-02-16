import type { ReactNode } from 'react';
import ArrowN from '../../../../../resources/arrow-n.svg';
import ArrowNE from '../../../../../resources/arrow-ne.svg';
import ArrowSE from '../../../../../resources/arrow-se.svg';
import ArrowS from '../../../../../resources/arrow-s.svg';
import ArrowNone from '../../../../../resources/arrow-none.svg';
import type { Counts, AnswerID } from '../../../../shared/health';
import type { Sample } from '../common/Trendline';

export function getMood(counts: Readonly<Counts>): AnswerID {
  const votes = counts.good + counts.mid + counts.bad;
  if (!votes) {
    return 'skip';
  }
  const dir = (counts.good - counts.bad) * 3;
  return dir > votes ? 'good' : dir < -votes ? 'bad' : 'mid';
}

export function getTrend(samples: Sample[]) {
  if (samples.length < 2) {
    return null;
  }
  const cur = samples[samples.length - 1]!;
  const prev = samples[samples.length - 2]!;
  if (cur.sd >= 2 || prev.sd >= 2) {
    return null;
  }
  const diff = cur.avg - prev.avg;
  return Math.max(-2, Math.min(2, Math.round(diff / 0.8)));
}

export const TREND_ARROWS = new Map<number | null, ReactNode>([
  [
    2,
    <ArrowN
      role="img"
      aria-label="rapid improvement"
      title="rapid improvement"
    />,
  ],
  [1, <ArrowNE role="img" aria-label="improvement" title="improvement" />],
  [0, <ArrowNone role="img" aria-label="no change" title="no change" />],
  [-1, <ArrowSE role="img" aria-label="decline" title="decline" />],
  [-2, <ArrowS role="img" aria-label="rapid decline" title="rapid decline" />],
]);
