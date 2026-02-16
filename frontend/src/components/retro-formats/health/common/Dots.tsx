import type { FunctionComponent } from 'react';
import { plural } from '../../../../time/formatters';
import './Dots.css';

interface PropsT {
  count: number;
}

export const Dots: FunctionComponent<PropsT> = ({ count }) => (
  <span
    className={`vote-dots n${count}`}
    aria-label={plural(count, 'participant')}
  >
    {'\u2B24'.repeat(count) || '\u2014'}
  </span>
);
