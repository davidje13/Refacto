import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import type { RetroItem } from 'refacto-entities';
import VoteCount from './VoteCount';
import WrappedButton from '../../../common/WrappedButton';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

interface PropsT {
  item: RetroItem;
  onSelect?: () => void;
  onVote?: () => void;
  onEdit?: () => void;
}

const MoodItemPlain = ({
  item,
  onSelect,
  onVote,
  onEdit,
}: PropsT): React.ReactElement => (
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
);

MoodItemPlain.propTypes = {
  item: propTypesShapeItem.isRequired,
  onSelect: PropTypes.func,
  onVote: PropTypes.func,
  onEdit: PropTypes.func,
};

MoodItemPlain.defaultProps = {
  onSelect: undefined,
  onVote: undefined,
  onEdit: undefined,
};

forbidExtraProps(MoodItemPlain);

export default React.memo(MoodItemPlain);
