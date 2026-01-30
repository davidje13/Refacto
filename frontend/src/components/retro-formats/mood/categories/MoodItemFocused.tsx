import { useRef, useEffect, memo } from 'react';
import type { RetroItem } from '../../../../shared/api-entities';
import { VoteCount } from './VoteCount';
import { Timer } from './timer/Timer';
import { Attachment } from '../../../attachments/Attachment';

interface PropsT {
  item: RetroItem;
  focusedItemTimeout?: number;
  autoScroll?: boolean;
  onAddExtraTime?: ((time: number) => void) | undefined;
  onCancel?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
  onContinue?: (() => void) | undefined;
}

export const MoodItemFocused = memo(
  ({
    item,
    focusedItemTimeout = 0,
    autoScroll = false,
    onAddExtraTime,
    onCancel,
    onClose,
    onContinue,
  }: PropsT) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (autoScroll && window.top === window.self) {
        ref.current?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, [ref, autoScroll]);

    return (
      <div className="mood-item focused">
        <div className="scroll-target" ref={ref} />
        <div className="message">{item.message}</div>
        <VoteCount votes={item.votes} />
        <Attachment attachment={item.attachment} />
        <div className="navigation">
          {onCancel && (
            <button
              type="button"
              title="Back (left arrow)"
              className="cancel"
              onClick={onCancel}
            >
              back
            </button>
          )}
          <div className="spacer" />
          {onClose && (
            <button
              type="button"
              title="Done (enter)"
              className="close"
              onClick={onClose}
            >
              done
            </button>
          )}
          {onContinue && (
            <button
              type="button"
              title="Next (right arrow)"
              className="continue"
              onClick={onContinue}
            >
              Next
            </button>
          )}
        </div>
        <Timer
          targetTime={focusedItemTimeout}
          onAddExtraTime={onAddExtraTime}
        />
      </div>
    );
  },
);
