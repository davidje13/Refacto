import React from 'react';
import PropTypes from 'prop-types';
import useCountdown from 'react-hook-countdown';
import TimeRemaining from './TimeRemaining';
import TimeUp from './TimeUp';
import forbidExtraProps from '../../../../../helpers/forbidExtraProps';

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

Timer.propTypes = {
  targetTime: PropTypes.number.isRequired,
  onAddExtraTime: PropTypes.func,
};

Timer.defaultProps = {
  onAddExtraTime: undefined,
};

forbidExtraProps(Timer);

export default React.memo(Timer);
