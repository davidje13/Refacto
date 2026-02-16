import type { FunctionComponent } from 'react';
import type { RetroHistoryItem } from '../../../../shared/api-entities';
import type { HealthSummary } from '../../../../shared/health';
import type { HealthQuestion } from '../../../../actions/healthRetro';
import { plural } from '../../../../time/formatters';
import { Trendline } from '../common/Trendline';
import { Dots } from '../common/Dots';
import { ALL_ANSWERS, getAnswer } from '../answers';
import { useHealthSamples } from './useHealthSamples';
import { getMood, getTrend, TREND_ARROWS } from './icons';
import './Overview.css';

interface PropsT {
  questions: HealthQuestion[];
  summary: HealthSummary;
  retroHistory: RetroHistoryItem[];
  onBack?: (() => void) | undefined;
  onExpand?: ((id: string) => void) | undefined;
  onArchive?: (() => void) | undefined;
  onImport?: (() => void) | undefined;
}

export const Overview: FunctionComponent<PropsT> = ({
  questions,
  summary,
  retroHistory,
  onBack,
  onExpand,
  onArchive,
  onImport,
}) => (
  <section className="health-discussion-overview">
    {onBack ? (
      <button type="button" className="back-intro" onClick={onBack}>
        Back to Introduction
      </button>
    ) : null}
    <table>
      <thead>
        <tr>
          <th className="q">Question</th>
          {ALL_ANSWERS.map((a) => (
            <th
              key={a.id}
              className={`votes ${a.id}`}
              title={a.label}
              aria-label={a.label}
            >
              {a.icon}
            </th>
          ))}
          <th className="t">Trend</th>
          <th className="d" aria-label="Recent Trend"></th>
          <th className="s" aria-label="Summary"></th>
          <th className="expand" aria-label="Expand"></th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q) => (
          <OverviewRow
            key={q.id}
            question={q}
            summary={summary}
            retroHistory={retroHistory}
            onExpand={onExpand ? () => onExpand(q.id) : undefined}
          />
        ))}
      </tbody>
    </table>
    <section className="options">
      {onImport ? (
        <button type="button" className="global-button" onClick={onImport}>
          Import Past Results
        </button>
      ) : undefined}
      {onArchive ? (
        <button
          type="button"
          className="global-button primary"
          onClick={onArchive}
        >
          Finish and Create Archive
        </button>
      ) : undefined}
    </section>
  </section>
);

interface RowPropsT {
  question: HealthQuestion;
  summary: HealthSummary;
  retroHistory: RetroHistoryItem[];
  onExpand?: (() => void) | undefined;
}

const OverviewRow: FunctionComponent<RowPropsT> = ({
  question,
  summary,
  retroHistory,
  onExpand,
}) => {
  const { counts, samples } = useHealthSamples(
    summary,
    retroHistory,
    question.id,
  );
  const trend = getTrend(samples);

  return (
    <tr onClick={onExpand}>
      <td className="q" title={question.title}>
        {question.title}
      </td>
      {ALL_ANSWERS.map((a) => (
        <td
          key={a.id}
          className={`votes ${a.id}`}
          title={plural(counts[a.id], 'participant')}
        >
          <Dots count={counts[a.id]} />
        </td>
      ))}
      <td className="t">
        <Trendline samples={samples} />
      </td>
      <td className={`d n${trend ?? ''}`}>{TREND_ARROWS.get(trend)}</td>
      <td className="s">{getAnswer(getMood(counts))?.flatIcon}</td>
      <td className="expand">
        {onExpand ? (
          <button
            type="button"
            aria-label="Expand"
            title="Expand"
            onClick={onExpand}
          >
            +
          </button>
        ) : null}
      </td>
    </tr>
  );
};
