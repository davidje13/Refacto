import React from 'react';

interface PropsT {
  remaining: number;
}

const TimeRemaining = ({ remaining }: PropsT): React.ReactElement => (
  <p className="countdown">
    { Math.floor(remaining / 1000 / 60) }
    :
    { String(Math.floor(remaining / 1000) % 60).padStart(2, '0') }
  </p>
);

export default React.memo(TimeRemaining);
