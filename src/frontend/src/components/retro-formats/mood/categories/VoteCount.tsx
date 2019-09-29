import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import WrappedButton from '../../../common/WrappedButton';

interface PropsT {
  votes: number;
  onVote?: () => void;
}

const VoteCount = ({
  votes,
  onVote,
}: PropsT): React.ReactElement => (
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
  onVote: undefined,
};

forbidExtraProps(VoteCount);

export default React.memo(VoteCount);
