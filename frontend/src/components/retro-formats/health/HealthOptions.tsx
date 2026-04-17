import type { FunctionComponent } from 'react';
import type { HealthQuestion } from '../../../actions/healthRetro';
import type { Spec } from '../../../api/reducer';
import type { RetroFormatOptionsProps } from '../formats';
import { optionHealthQuestions } from './healthOptionKeys';
import './HealthOptions.css';

export const HealthOptions: FunctionComponent<RetroFormatOptionsProps> = ({
  retroOptions,
  onChangeOption,
}) => (
  <>
    <h2>Questions</h2>
    <ol className="health-option-questions">
      {optionHealthQuestions.read(retroOptions).map((q) => (
        <li key={q.id}>
          <QuestionOptions
            question={q}
            onChange={(spec) =>
              onChangeOption(
                optionHealthQuestions.specApply([
                  'update',
                  ['all', { id: ['=', q.id] }],
                  spec,
                ]),
              )
            }
          />
        </li>
      ))}
    </ol>
  </>
);

const QuestionOptions: FunctionComponent<{
  question: HealthQuestion;
  onChange: (spec: Spec<HealthQuestion>) => void;
}> = ({ question: { id, title, good, bad, enabled }, onChange }) => (
  <details className={enabled ? 'question' : 'question skip'}>
    <summary>
      <span className="label">{title}</span>
    </summary>
    <div className="content">
      <label>
        Title
        <input
          name={`q-${id}-question`}
          type="text"
          value={title}
          onChange={(e) => onChange({ title: ['=', e.currentTarget.value] })}
          autoComplete="off"
          required
        />
      </label>
      <label>
        Example of &ldquo;good&rdquo;
        <input
          name={`q-${id}-good`}
          type="text"
          value={good}
          onChange={(e) => onChange({ good: ['=', e.currentTarget.value] })}
          autoComplete="off"
          required
        />
      </label>
      <label>
        Example of &ldquo;bad&rdquo;
        <input
          name={`q-${id}-bad`}
          type="text"
          value={bad}
          onChange={(e) => onChange({ bad: ['=', e.currentTarget.value] })}
          autoComplete="off"
          required
        />
      </label>
      <label className="checkbox">
        <input
          name={`q-${id}-enabled`}
          type="checkbox"
          checked={!enabled}
          onChange={(e) =>
            onChange({ enabled: ['=', !e.currentTarget.checked] })
          }
          autoComplete="off"
        />
        Skip
      </label>
    </div>
  </details>
);
