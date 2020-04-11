import React, { memo } from 'react';
import classNames from 'classnames';
import type { RetroItem } from 'refacto-entities';
import VoteCount from './VoteCount';
import WrappedButton from '../../../common/WrappedButton';

interface PropsT {
  item: RetroItem;
  onSelect?: () => void;
  onVote?: () => void;
  onEdit?: () => void;
}

export default memo(({
  item,
  onSelect,
  onVote,
  onEdit,
}: PropsT) => (
  <div className={classNames('mood-item', { done: item.doneTime > 0 })}>
    <WrappedButton className="message" onClick={onSelect}>
      { item.message }
    </WrappedButton>
    <VoteCount votes={item.votes} onVote={onVote} />
    <WrappedButton
      title="Edit"
      className="edit"
      onClick={onEdit}
      hideIfDisabled
    />
  </div>
));
