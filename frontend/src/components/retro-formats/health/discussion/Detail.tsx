import type { FunctionComponent } from 'react';
import type {
  RetroHistoryItem,
  RetroItem,
} from '../../../../shared/api-entities';
import type { Counts, HealthSummary } from '../../../../shared/health';
import type { HealthQuestion } from '../../../../actions/healthRetro';
import { formatDate, plural } from '../../../../time/formatters';
import { Trendline } from '../common/Trendline';
import { Examples } from '../common/Examples';
import { Dots } from '../common/Dots';
import { ALL_ANSWERS, getAnswer } from '../answers';
import { useHealthSamples } from './useHealthSamples';
import { getMood, getTrend, TREND_ARROWS } from './icons';
import './Detail.css';

interface PropsT {
  question: HealthQuestion;
  summary: HealthSummary;
  retroItems: RetroItem[];
  retroHistory: RetroHistoryItem[];
  onClose?: (() => void) | undefined;
}

export const Detail: FunctionComponent<PropsT> = ({
  question,
  summary,
  retroItems,
  retroHistory,
  onClose,
}) => {
  const { counts, previous, samples } = useHealthSamples(
    summary,
    retroHistory,
    question.id,
  );
  const trend = getTrend(samples);
  const comments = retroItems.filter(
    (item) => item.id.startsWith(`${question.id}:`) && item.message,
  );

  return (
    <section className="health-discussion-detail">
      <section className="tile">
        {onClose ? (
          <button
            type="button"
            className="back"
            onClick={onClose}
            title="Back to list"
            aria-label="Back to list"
          >
            List
          </button>
        ) : null}
        <h2>{question.title}</h2>
        <section className="summary">
          {getAnswer(getMood(counts))?.flatIcon}
        </section>
        <Examples question={question} />
        <h3>Answers</h3>
        <AnswerTable counts={counts} />
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((item) => (
            <p key={item.id} className={`comment ${item.category}`}>
              {item.message}
            </p>
          ))
        ) : (
          <p>
            <em>none</em>
          </p>
        )}
        {previous ? (
          <>
            <h3>Previous Answers ({formatDate(previous.time)})</h3>
            <AnswerTable counts={previous.counts} />
            <h3>Trend</h3>
            <div className="trend-graphic">
              <Trendline samples={samples} />
              <div className={`arrow n${trend ?? ''}`}>
                {TREND_ARROWS.get(trend)}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </section>
  );
};

const AnswerTable: FunctionComponent<{ counts: Counts }> = ({ counts }) => (
  <table className="votes">
    <thead>
      <tr>
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
      </tr>
    </thead>
    <tbody>
      <tr>
        {ALL_ANSWERS.map((a) => (
          <td
            key={a.id}
            className={`votes ${a.id}`}
            title={plural(counts[a.id], 'participant')}
          >
            <Dots count={counts[a.id]} />
          </td>
        ))}
      </tr>
    </tbody>
  </table>
);
