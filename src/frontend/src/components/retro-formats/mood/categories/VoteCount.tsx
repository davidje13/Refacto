import React, { memo } from 'react';
import WrappedButton from '../../../common/WrappedButton';

interface PropsT {
  votes: number;
  onVote?: () => void;
}

export default memo(({
  votes,
  onVote,
}: PropsT) => (
  <WrappedButton
    className="vote"
    title="Agree with this"
    disabledTitle={`${votes} agree with this`}
    onClick={onVote}
  >
    {votes}
  </WrappedButton>
));
