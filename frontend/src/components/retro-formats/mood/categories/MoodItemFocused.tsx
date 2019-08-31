import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RetroItem } from 'refacto-entities';
import VoteCount from './VoteCount';
import Timer from './timer/Timer';
import WrappedButton from '../../../common/WrappedButton';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';
import Attachment from '../../../attachments/Attachment';

interface PropsT {
  item: RetroItem;
  focusedItemTimeout: number;
  autoScroll: boolean;
  onAddExtraTime?: (time: number) => void;
  onCancel?: () => void;
  onDone?: () => void;
}

const MoodItemFocused = ({
  item,
  focusedItemTimeout,
  autoScroll,
  onAddExtraTime,
  onCancel,
  onDone,
}: PropsT): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO TypeScript#16
    if (autoScroll && ref.current && ref.current.scrollIntoView) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [ref, autoScroll]);

  return (
    <div className="mood-item focused">
      <div className="scroll-target" ref={ref} />
      <div className="message">{ item.message }</div>
      <VoteCount votes={item.votes} />
      <Attachment attachment={item.attachment} />
      <WrappedButton title="Cancel" className="cancel" onClick={onCancel} hideIfDisabled>
        Cancel
      </WrappedButton>
      <WrappedButton title="Done" className="close" onClick={onDone} hideIfDisabled>
        Done
      </WrappedButton>
      <Timer targetTime={focusedItemTimeout} onAddExtraTime={onAddExtraTime} />
    </div>
  );
};

MoodItemFocused.propTypes = {
  item: propTypesShapeItem.isRequired,
  focusedItemTimeout: PropTypes.number,
  autoScroll: PropTypes.bool,
  onAddExtraTime: PropTypes.func,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
};

MoodItemFocused.defaultProps = {
  focusedItemTimeout: 0,
  onAddExtraTime: undefined,
  autoScroll: false,
  onCancel: undefined,
  onDone: undefined,
};

forbidExtraProps(MoodItemFocused);

export default React.memo(MoodItemFocused);
