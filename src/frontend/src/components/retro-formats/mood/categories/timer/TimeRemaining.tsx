import React, { memo } from 'react';

interface PropsT {
  remaining: number;
}

export default memo(({ remaining }: PropsT) => (
  <p className="countdown">
    {Math.floor(remaining / 1000 / 60)}:
    {String(Math.floor(remaining / 1000) % 60).padStart(2, '0')}
  </p>
));
