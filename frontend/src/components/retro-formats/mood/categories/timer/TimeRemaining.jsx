import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../../helpers/forbidExtraProps';

const TimeRemaining = ({ remaining }) => (
  <p className="countdown">
    { Math.floor(remaining / 1000 / 60) }
    :
    { String(Math.floor(remaining / 1000) % 60).padStart(2, '0') }
  </p>
);

TimeRemaining.propTypes = {
  remaining: PropTypes.number.isRequired,
};

forbidExtraProps(TimeRemaining);

export default React.memo(TimeRemaining);
