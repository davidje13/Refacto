import { memo } from 'react';
import { classNames } from '../../../../helpers/classNames';
import type { RetroItem } from '../../../../shared/api-entities';
import { VoteCount } from './VoteCount';
import TickBold from '../../../../../resources/tick-bold.svg';

interface PropsT {
  item: RetroItem;
  onSelect?: (() => void) | undefined;
  onVote?: (() => void) | undefined;
  onEdit?: (() => void) | undefined;
}

export const MoodItemPlain = memo(
  ({ item, onSelect, onVote, onEdit }: PropsT) => {
    const done = item.doneTime > 0;

    return (
      <div className={classNames('mood-item', { done })}>
        <button
          type="button"
          className="message"
          disabled={!onSelect}
          onClick={onSelect}
        >
          {item.message}
        </button>
        <VoteCount votes={item.votes} onVote={onVote} />
        {onEdit && (
          <button
            type="button"
            title="Edit"
            className="edit"
            onClick={onEdit}
          />
        )}
        {done && (
          <TickBold className="tick" aria-label="Discussed" role="img" />
        )}
      </div>
    );
  },
);
