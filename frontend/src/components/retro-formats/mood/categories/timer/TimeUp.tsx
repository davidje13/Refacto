import { memo } from 'react';

interface PropsT {
  onAddExtraTime?: ((time: number) => void) | undefined;
}

export const TimeUp = memo(({ onAddExtraTime }: PropsT) => {
  const extraMinutes = 2;

  const extraTime = extraMinutes * 60 * 1000 + 999;
  const extraTimeLabel = `+${extraMinutes} more minutes`;

  return (
    <>
      <p className="timeup">Time&rsquo;s up!</p>
      {onAddExtraTime && (
        <button type="button" onClick={() => onAddExtraTime(extraTime)}>
          {extraTimeLabel}
        </button>
      )}
    </>
  );
});
