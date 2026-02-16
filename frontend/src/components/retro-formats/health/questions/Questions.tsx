import { useLayoutEffect, type FunctionComponent } from 'react';
import { Link } from 'wouter';
import type { RetroItem } from '../../../../shared/api-entities';
import type { AnswerID } from '../../../../shared/health';
import { startViewTransition } from '../../../../helpers/viewTransition';
import { classNames } from '../../../../helpers/classNames';
import { useStateMap } from '../../../../hooks/useStateMap';
import {
  getQuestionProgress,
  makeUserAnswerID,
  type HealthQuestion,
} from '../../../../actions/healthRetro';
import { Examples } from '../common/Examples';
import { ABSTAIN, ANSWERS } from '../answers';
import './Questions.css';

interface PropsT {
  userID: string;
  questions: HealthQuestion[];
  retroItems: RetroItem[];
  settingsLink?: string | undefined;
  onAnswer: (questionID: string, vote: AnswerID, message: string) => void;
  onCancel: () => void;
  onComplete: () => void;
}

export const Questions: FunctionComponent<PropsT> = ({
  userID,
  questions,
  retroItems,
  settingsLink,
  onAnswer,
  onCancel,
  onComplete,
}) => {
  const [current, setCurrent] = useStateMap('health-progress', userID, '');

  if (!questions.length) {
    return (
      <div className="hold">
        <section className="tile">
          <h2>No questions</h2>
          <p>There are no questions to complete.</p>
          {settingsLink ? (
            <p>
              Try adding some in the <Link to={settingsLink}>settings</Link>.
            </p>
          ) : null}
          <button type="button" className="global-button" onClick={onCancel}>
            Cancel
          </button>
        </section>
      </div>
    );
  }

  const { currentIndex, nextIndex } = getQuestionProgress(
    questions,
    retroItems,
    userID,
    current,
  );
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="hold">
        <section className="tile">
          <h2>The questions have changed</h2>
          <p>
            The questions have been changed while you were submitting your
            answers.
          </p>
          <button
            type="button"
            className="global-button primary"
            onClick={() => setCurrent(questions[0]?.id ?? '')}
          >
            Review answers
          </button>
        </section>
      </div>
    );
  }

  const answerID = makeUserAnswerID(currentQuestion.id, userID);
  const existingAnswer = retroItems.find((item) => item.id === answerID);

  return (
    <Question
      question={currentQuestion}
      answerID={answerID}
      existingAnswer={existingAnswer}
      showGuidance={currentIndex === 0 && !existingAnswer}
      onAnswer={(vote: AnswerID, message: string) =>
        onAnswer(currentQuestion.id, vote, message)
      }
      onNext={() => {
        if (nextIndex !== null) {
          setCurrent(questions[nextIndex]!.id);
        } else {
          onComplete();
        }
      }}
      prevLabel={currentIndex > 0 ? 'Previous question' : 'Cancel'}
      onPrev={
        currentIndex > 0
          ? () => setCurrent(questions[currentIndex - 1]!.id)
          : !existingAnswer
            ? onCancel
            : undefined
      }
    />
  );
};

interface QuestionPropsT {
  question: HealthQuestion;
  answerID: string;
  existingAnswer?: RetroItem | undefined;
  showGuidance?: boolean;
  onAnswer: (vote: AnswerID, message: string) => void;
  onNext: () => void;
  prevLabel: string;
  onPrev: (() => void) | undefined;
}

const Question: FunctionComponent<QuestionPropsT> = ({
  question,
  answerID,
  existingAnswer,
  showGuidance,
  onAnswer,
  onNext,
  prevLabel,
  onPrev,
}) => {
  const [message, setMessage] = useStateMap(
    'health-message',
    answerID,
    existingAnswer?.message ?? '',
  );

  useLayoutEffect(() => {
    if (existingAnswer) {
      setMessage(existingAnswer.message);
    }
  }, [existingAnswer?.id]);

  const addAnswer = (btn: HTMLButtonElement, vote: AnswerID) =>
    startViewTransition('health-advance', () => {
      btn.blur();
      onAnswer(vote, message);
      onNext();
    });

  return (
    <form
      className="hold health-questions"
      onSubmit={(e) => e.preventDefault()}
    >
      <section className="tile">
        {onPrev ? (
          <button
            type="button"
            className="back"
            aria-label={prevLabel}
            title={prevLabel}
            onClick={() => startViewTransition('health-prev', onPrev)}
          />
        ) : null}
        {existingAnswer ? (
          <button
            type="button"
            className="next"
            aria-label="Next question"
            title="Next question"
            onClick={() =>
              startViewTransition('health-next', () => {
                if (message !== existingAnswer.message) {
                  onAnswer(existingAnswer.category as AnswerID, message);
                }
                onNext();
              })
            }
          />
        ) : null}
        <h2>{question.title}?</h2>
        <Examples question={question} />
      </section>
      {showGuidance ? (
        <p className="info">
          Select how you think this is going in your team. Only discuss with
          others if you need clarification on what is being asked.
        </p>
      ) : (
        <div />
      )}
      <section className="comments">
        <label>
          Comment for discussion (optional)
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
        </label>
      </section>
      <section className="answers">
        {ANSWERS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button" // using button instead of submit so that the form does not auto-pick "good" when pressing enter; user must pick explicitly
            className={classNames('answer', id)}
            aria-pressed={existingAnswer?.category === id}
            onClick={(e) => addAnswer(e.currentTarget, id)}
          >
            <span className="icon" role="presentation">
              {icon}
            </span>
            <span className="label">{label}</span>
          </button>
        ))}
      </section>

      <button
        type="button"
        className="skip"
        onClick={(e) => addAnswer(e.currentTarget, 'skip')}
        aria-pressed={existingAnswer?.category === 'skip'}
        aria-label={ABSTAIN.label}
        title={ABSTAIN.label}
      >
        {ABSTAIN.icon}
      </button>
    </form>
  );
};
