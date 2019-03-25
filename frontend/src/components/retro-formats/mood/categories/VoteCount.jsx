import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import WrappedButton from '../../../common/WrappedButton';

const VoteCount = ({
  votes,
  onVote,
}) => (
  <WrappedButton
    className="vote"
    title="Agree with this"
    disabledTitle={`${votes} agree with this`}
    onClick={onVote}
  >
    {votes}
  </WrappedButton>
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
