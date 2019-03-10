import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import VoteCount from './VoteCount';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';

export const MoodItemPlain = ({
  item,
  onSelect,
  onVote,
  onEdit,
}) => (
  <div className={classNames('mood-item', { done: item.done })}>
    <button type="button" className="message" onClick={onSelect} disabled={onSelect === null}>
      { item.message }
    </button>
    <VoteCount votes={item.votes} onVote={onVote} />
    { onEdit && (
      <button type="button" title="Edit" className="edit" onClick={onEdit} />
    ) }
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
