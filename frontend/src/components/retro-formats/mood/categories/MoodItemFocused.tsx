import React from 'react';
import PropTypes from 'prop-types';
import { RetroItem } from 'refacto-entities';
import VoteCount from './VoteCount';
import Timer from './timer/Timer';
import WrappedButton from '../../../common/WrappedButton';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

interface PropsT {
  item: RetroItem;
  focusedItemTimeout: number;
  onAddExtraTime?: (time: number) => void;
  onCancel?: () => void;
  onDone?: () => void;
}

const MoodItemFocused = ({
  item,
  focusedItemTimeout,
  onAddExtraTime,
  onCancel,
  onDone,
}: PropsT): React.ReactElement => (
  <div className="mood-item focused">
    <div className="message">{ item.message }</div>
    <VoteCount votes={item.votes} />
    <WrappedButton title="Cancel" className="cancel" onClick={onCancel}>
      Cancel
    </WrappedButton>
    <WrappedButton title="Done" className="close" onClick={onDone}>
      Done
    </WrappedButton>
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
  onAddExtraTime: undefined,
  onCancel: undefined,
  onDone: undefined,
};

forbidExtraProps(MoodItemFocused);

export default React.memo(MoodItemFocused);
