import React from 'react';
import useCountdown from 'react-hook-countdown';
import TimeRemaining from './TimeRemaining';
import TimeUp from './TimeUp';

interface PropsT {
  targetTime: number;
  onAddExtraTime?: (time: number) => void;
}

const Timer = ({ targetTime, onAddExtraTime }: PropsT): React.ReactElement => {
  const remaining = useCountdown(targetTime, 1000);

  let component;
  if (remaining >= 0) {
    component = (<TimeRemaining remaining={remaining} />);
  } else {
    component = (<TimeUp onAddExtraTime={onAddExtraTime} />);
  }

  return (<div className="timer">{ component }</div>);
};

Timer.defaultProps = {
  onAddExtraTime: undefined,
};

export default React.memo(Timer);
