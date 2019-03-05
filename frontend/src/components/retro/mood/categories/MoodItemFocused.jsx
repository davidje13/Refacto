import React from 'react';
import PropTypes from 'prop-types';
import VoteCount from './VoteCount';
import Timer from './timer/Timer';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';

export const MoodItemFocused = ({
  item,
  focusedItemTimeout,
  onAddExtraTime,
  onCancel,
  onDone,
}) => (
  <div className="mood-item focused">
    <div className="message">{ item.message }</div>
    <VoteCount votes={item.votes} />
    <button type="button" title="Cancel" className="cancel" onClick={onCancel}>
      Cancel
    </button>
    <button type="button" title="Done" className="close" onClick={onDone}>
      Done
    </button>
    <Timer targetTime={focusedItemTimeout} onAddExtraTime={onAddExtraTime} />
  </div>
);

MoodItemFocused.propTypes = {
  item: propTypesShapeItem.isRequired,
  focusedItemTimeout: PropTypes.number,
  onAddExtraTime: PropTypes.func,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
};

MoodItemFocused.defaultProps = {
  focusedItemTimeout: 0,
  onAddExtraTime: null,
  onCancel: null,
  onDone: null,
};

forbidExtraProps(MoodItemFocused);

export default React.memo(MoodItemFocused);
