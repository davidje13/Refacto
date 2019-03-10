import React from 'react';
import PropTypes from 'prop-types';
import TimeRemaining from './TimeRemaining';
import TimeUp from './TimeUp';
import useCountdown from '../../../../../hooks/useCountdown';
import forbidExtraProps from '../../../../../helpers/forbidExtraProps';

export const Timer = ({
  targetTime,
  onAddExtraTime,
}) => {
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
  onAddExtraTime: null,
};

forbidExtraProps(Timer);

export default React.memo(Timer);
