import { Suspense, memo, lazy, type ComponentType } from 'react';
import type { RetroItem } from '../../shared/api-entities';
import type { RetroDispatch } from '../../api/RetroTracker';
import { LoadingIndicator } from '../common/Loader';
import { UnknownRetro } from './unknown/UnknownRetro';

interface ChildPropsT {
  className?: string;
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: Record<string, unknown>;
  group?: string | undefined;
  dispatch?: RetroDispatch | undefined;
  onComplete?: (() => void) | undefined;
  archive: boolean;
  archiveTime?: number;
}

interface PropsT extends Omit<ChildPropsT, 'archive'> {
  retroFormat: string;
  archive?: boolean;
}

const formats = new Map<string, ComponentType<ChildPropsT>>([
  [
    'mood',
    lazy(() =>
      import('./mood/MoodRetro').then((m) => ({ default: m.MoodRetro })),
    ),
  ],
]);

const LOADER = <LoadingIndicator />;

export const RetroFormat = memo(
  ({ retroFormat, archive = false, ...props }: PropsT) => {
    const RetroType = formats.get(retroFormat) || UnknownRetro;

    return (
      <Suspense fallback={LOADER}>
        <RetroType archive={archive} {...props} />
      </Suspense>
    );
  },
);
