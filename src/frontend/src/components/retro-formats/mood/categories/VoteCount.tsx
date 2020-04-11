import React from 'react';
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

export default React.memo(VoteCount);
