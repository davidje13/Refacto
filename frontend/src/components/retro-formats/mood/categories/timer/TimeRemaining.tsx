import { memo } from 'react';
import { formatDurationShort } from '../../../../../time/formatters';

interface PropsT {
  remaining: number;
}

export const TimeRemaining = memo(({ remaining }: PropsT) => (
  <p className="countdown">{formatDurationShort(remaining)}</p>
));
