import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import VoteCount from './VoteCount';
import WrappedButton from '../../../common/WrappedButton';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

const MoodItemPlain = ({
  item,
  onSelect,
  onVote,
  onEdit,
}) => (
  <div className={classNames('mood-item', { done: item.done })}>
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
  onSelect: null,
  onVote: null,
  onEdit: null,
};

forbidExtraProps(MoodItemPlain);

export default React.memo(MoodItemPlain);
