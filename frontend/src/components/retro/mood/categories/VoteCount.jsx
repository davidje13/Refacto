import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';

export const VoteCount = ({
  votes,
  onVote,
}) => (
  <button
    type="button"
    className="vote"
    title={onVote === null ? `${votes} agree with this` : 'Agree with this'}
    disabled={onVote === null}
    onClick={onVote}
  >
    {votes}
  </button>
);

VoteCount.propTypes = {
  votes: PropTypes.number.isRequired,
  onVote: PropTypes.func,
};

VoteCount.defaultProps = {
  onVote: null,
};

forbidExtraProps(VoteCount);

export default React.memo(VoteCount);
