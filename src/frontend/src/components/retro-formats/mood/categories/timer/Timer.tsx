import React, { memo } from 'react';
import useCountdown from 'react-hook-final-countdown';
import TimeRemaining from './TimeRemaining';
import TimeUp from './TimeUp';

interface PropsT {
  targetTime: number;
  onAddExtraTime?: (time: number) => void;
}

export default memo(({ targetTime, onAddExtraTime }: PropsT) => {
  const remaining = useCountdown(targetTime, 1000);

  let component;
  if (remaining >= 0) {
    component = <TimeRemaining remaining={remaining} />;
  } else {
    component = <TimeUp onAddExtraTime={onAddExtraTime} />;
  }

  return <div className="timer">{component}</div>;
});
