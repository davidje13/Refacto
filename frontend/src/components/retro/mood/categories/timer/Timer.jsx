import React from 'react';
import PropTypes from 'prop-types';
import TimeRemaining from './TimeRemaining';
import TimeUp from './TimeUp';
import LiveTimer from '../../../../common/LiveTimer';
import forbidExtraProps from '../../../../../helpers/forbidExtraProps';

export const Timer = ({
  targetTime,
  onAddExtraTime,
}) => (
  <div className="timer">
    <LiveTimer
      targetTime={targetTime}
      refreshInterval={1000}
      Counter={TimeRemaining}
      Expired={TimeUp}
      onAddExtraTime={onAddExtraTime}
    />
  </div>
);

Timer.propTypes = {
  targetTime: PropTypes.number.isRequired,
  onAddExtraTime: PropTypes.func,
};

Timer.defaultProps = {
  onAddExtraTime: null,
};

forbidExtraProps(Timer);

export default React.memo(Timer);
