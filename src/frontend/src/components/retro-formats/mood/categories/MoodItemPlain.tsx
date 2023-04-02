import React, { memo } from 'react';
import classNames from 'classnames';
import type { RetroItem } from '../../../../shared/api-entities';
import VoteCount from './VoteCount';
import WrappedButton from '../../../common/WrappedButton';
import { ReactComponent as TickBold } from '../../../../../resources/tick-bold.svg';

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
}: PropsT) => {
  const done = item.doneTime > 0;

  return (
    <div className={classNames('mood-item', { done })}>
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
      { done && <TickBold className="tick" /> }
    </div>
  );
});
