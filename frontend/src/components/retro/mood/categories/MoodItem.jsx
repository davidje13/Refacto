import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './MoodItem.less';

export const MoodItem = ({
  item: {
    message,
    votes = 0,
    done = false,
  },
  focused,
}) => (
  <div className={classNames('mood-item', { done, focused })}>
    <div className="message">{message}</div>
    <button
      type="button"
      title="Agree with this"
      className="vote"
    >
      {votes}
    </button>
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
