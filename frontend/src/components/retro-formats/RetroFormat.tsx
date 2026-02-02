import { Suspense, memo } from 'react';
import { LoadingIndicator } from '../common/Loader';
import { getRetroFormatDetails, type RetroFormatProps } from './formats';

interface PropsT extends Omit<RetroFormatProps, 'archive'> {
  retroFormat: string;
  archive?: boolean;
}

export const RetroFormat = memo(
  ({ retroFormat, archive = false, ...props }: PropsT) => {
    const RetroType = getRetroFormatDetails(retroFormat).component;

    return (
      <Suspense fallback={LOADER}>
        <RetroType archive={archive} {...props} />
      </Suspense>
    );
  },
);

const LOADER = <LoadingIndicator />;
