import type { FunctionComponent } from 'react';
import type { HealthQuestion } from '../../../../actions/healthRetro';
import './Examples.css';

interface PropsT {
  question: HealthQuestion;
}

export const Examples: FunctionComponent<PropsT> = ({ question }) => (
  <section className="health-examples">
    <section className="example good">
      <h3>Good is</h3>
      <p>{question.good}</p>
    </section>
    <section className="example bad">
      <h3>Bad is</h3>
      <p>{question.bad}</p>
    </section>
  </section>
);
