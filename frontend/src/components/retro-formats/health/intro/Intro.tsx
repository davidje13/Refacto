import type { FunctionComponent, ReactNode } from 'react';
import type { RetroItem } from '../../../../shared/api-entities';
import {
  getAnswerCount,
  type HealthQuestion,
} from '../../../../actions/healthRetro';
import { plural } from '../../../../time/formatters';
import './Intro.css';

interface PropsT {
  questions: HealthQuestion[];
  retroItems: RetroItem[];
  onBeginAnswering?: (() => void) | undefined;
  onBack?: (() => void) | undefined;
  onDiscuss?: (() => void) | undefined;
  onInvite?: (() => void) | undefined;
}

export const Intro: FunctionComponent<PropsT> = ({
  questions,
  retroItems,
  onBeginAnswering,
  onBack,
  onDiscuss,
  onInvite,
}) => {
  const answerCounts = questions.map((q) => ({
    id: q.id,
    title: q.title,
    count: getAnswerCount(retroItems, q.id),
  }));

  const canDiscuss = !answerCounts.some((q) => q.count === 0);

  let options: ReactNode;

  if (onBack) {
    options = (
      <section className="options">
        {onBeginAnswering ? (
          <button
            type="button"
            className="global-button"
            onClick={onBeginAnswering}
          >
            Answer Questions as somebody else
          </button>
        ) : null}
        {onDiscuss ? (
          <button
            type="button"
            className="global-button primary"
            onClick={onDiscuss}
            disabled={!canDiscuss}
          >
            Join Discussion
          </button>
        ) : null}
      </section>
    );
  } else {
    options = (
      <section className="options">
        {onDiscuss ? (
          <button
            type="button"
            className="global-button"
            onClick={onDiscuss}
            disabled={!canDiscuss}
          >
            Skip Questions and Join Discussion
          </button>
        ) : null}
        {onInvite ? (
          <button type="button" className="global-button" onClick={onInvite}>
            Invite Participants
          </button>
        ) : null}
        {onBeginAnswering ? (
          <button
            type="button"
            className="global-button primary"
            onClick={onBeginAnswering}
          >
            Answer Questions
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <div className="hold health-intro">
      <section className="tile">
        {onBack ? (
          <>
            <button
              type="button"
              className="back"
              aria-label="Previous question"
              title="Previous question"
              onClick={onBack}
            />
            <h2>Done!</h2>
            <p>
              If there is more than one person using this device, hand over to
              the next person to fill in their answers. Once everyone is done,
              join the discussion.
            </p>
          </>
        ) : (
          <>
            <h2>Welcome</h2>
            <p>
              Each team member should begin by answering the questions based on
              their own experience and perspective, without discussing them
              (other than for clarification).
            </p>
            {questions.length === 1 ? (
              <p>There is 1 question.</p>
            ) : (
              <p>
                There are {questions.length} questions, which should take about{' '}
                {plural(Math.ceil(questions.length / 2), 'minute')} to answer in
                total.
              </p>
            )}
            <p>
              Once everyone has finished, the team will discuss the answers as a
              group.
            </p>
          </>
        )}
        <p>Team progress:</p>
        <table>
          <thead>
            <tr>
              <th className="q">Topic</th>
              <th className="n">Answers</th>
            </tr>
          </thead>
          <tbody>
            {answerCounts.map(({ id, title, count }) => (
              <tr key={id}>
                <td className="q">{title}</td>
                <td className="n">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {options}
      </section>
    </div>
  );
};
