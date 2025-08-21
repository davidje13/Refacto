import { Suspense, memo, lazy, type ComponentType } from 'react';
import type { RetroItem } from '../../shared/api-entities';
import type { RetroDispatch } from '../../api/RetroTracker';
import { UnknownRetro } from './unknown/UnknownRetro';

interface ChildPropsT {
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

const formats = new Map<string, ComponentType<ChildPropsT>>();
formats.set(
  'mood',
  lazy(() =>
    import('./mood/MoodRetro').then((m) => ({ default: m.MoodRetro })),
  ),
);

const LOADER = <div className="loader">Loading&hellip;</div>;

export const RetroFormatPicker = memo(
  ({ retroFormat, archive = false, ...props }: PropsT) => {
    const RetroType = formats.get(retroFormat) || UnknownRetro;

    return (
      <Suspense fallback={LOADER}>
        <RetroType archive={archive} {...props} />
      </Suspense>
    );
  },
);
