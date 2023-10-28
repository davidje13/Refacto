import { memo, useCallback } from 'react';
import classNames from 'classnames';
import { WrappedButton } from '../../../common/WrappedButton';
import { useTemporary } from '../../../../hooks/useTemporary';
import Heart from '../../../../../resources/heart.svg';
import './VoteCount.less';

interface PropsT {
  votes: number;
  onVote?: (() => void) | undefined;
}

const MAX_VOTE_COUNT = 15;
const MAX_VOTE_SCALE = 0.8;
const MIN_CLICK_DELAY = 800;

function scale(n: number): number {
  const fraction = Math.log(n + 1) / Math.log(MAX_VOTE_COUNT + 1);
  return Math.min(fraction, 1) * MAX_VOTE_SCALE + 1;
}

export const VoteCount = memo(({ votes, onVote }: PropsT) => {
  const [click, clicking] = useTemporary(MIN_CLICK_DELAY);

  const clickFn = useCallback(() => {
    if (onVote && click()) {
      onVote();
    }
  }, [onVote, click]);

  return (
    <WrappedButton
      className={classNames('vote', {
        none: votes === 0,
        few: votes >= 1 && votes < 5,
        many: votes >= 5,
        clicking,
      })}
      title="Agree with this"
      disabledTitle={`${votes} agree with this`}
      onClick={onVote && clickFn}
    >
      <div className="inner">
        <div className="hearts" style={{ transform: `scale(${scale(votes)})` }}>
          <Heart className="heart n3" />
          <Heart className="heart n2" />
          <Heart className="heart n1" />
        </div>
      </div>
      <span className="count">{votes}</span>
    </WrappedButton>
  );
});
