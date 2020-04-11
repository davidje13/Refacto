import React, { memo } from 'react';
import WrappedButton from '../../../../common/WrappedButton';
import useBoundCallback from '../../../../../hooks/useBoundCallback';

interface PropsT {
  onAddExtraTime?: (time: number) => void;
}

export default memo(({
  onAddExtraTime,
}: PropsT) => {
  const extraMinutes = 2;

  const extraTime = extraMinutes * 60 * 1000 + 999;
  const handleAddExtraTime = useBoundCallback(onAddExtraTime, extraTime);
  const extraTimeLabel = `+${extraMinutes} more minutes`;

  return (
    <React.Fragment>
      <p className="timeup">Time&rsquo;s up!</p>
      <WrappedButton onClick={handleAddExtraTime} hideIfDisabled>
        { extraTimeLabel }
      </WrappedButton>
    </React.Fragment>
  );
});
