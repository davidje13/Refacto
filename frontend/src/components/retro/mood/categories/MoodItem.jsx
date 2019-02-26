import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';

export const MoodItem = ({
  item: {
    message,
    votes = 0,
    done = false,
  },
  focused,
}) => (
  <div className={classNames('mood-item', { done, focused })}>
    +{votes} {message}
  </div>
);

MoodItem.propTypes = {
  item: propTypesShapeItem.isRequired,
  focused: PropTypes.bool,
};

MoodItem.defaultProps = {
  focused: false,
};

forbidExtraProps(MoodItem);

export default React.memo(MoodItem);
