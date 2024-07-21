import { memo } from 'react';
import { WrappedButton } from '../../../../common/WrappedButton';
import { useEvent } from '../../../../../hooks/useEvent';

interface PropsT {
  onAddExtraTime?: ((time: number) => void) | undefined;
}

export const TimeUp = memo(({ onAddExtraTime }: PropsT) => {
  const extraMinutes = 2;

  const extraTime = extraMinutes * 60 * 1000 + 999;
  const handleAddExtraTime = useEvent(() => onAddExtraTime?.(extraTime));
  const extraTimeLabel = `+${extraMinutes} more minutes`;

  return (
    <>
      <p className="timeup">Time&rsquo;s up!</p>
      <WrappedButton
        onClick={onAddExtraTime ? handleAddExtraTime : undefined}
        hideIfDisabled
      >
        {extraTimeLabel}
      </WrappedButton>
    </>
  );
});
