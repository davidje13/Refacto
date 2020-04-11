import React, { Suspense } from 'react';
import type { Retro, RetroItem } from 'refacto-entities';
import UnknownRetro from './unknown/UnknownRetro';
import type { Dispatch } from '../../api/SharedReducer';

interface ChildPropsT {
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: object;
  dispatch?: Dispatch<Retro>;
  onComplete?: () => void;
  archive: boolean;
  archiveTime?: number;
}

interface PropsT extends Omit<ChildPropsT, 'archive'> {
  retroFormat: string;
  archive?: boolean;
}

const formats = new Map<string, React.ComponentType<ChildPropsT>>();
formats.set('mood', React.lazy(() => import('./mood/MoodRetro')));

const LOADER = (
  <div className="loader">Loading&hellip;</div>
);

const RetroFormatPicker = ({
  retroFormat,
  archive = false,
  ...props
}: PropsT): React.ReactElement => {
  const RetroType = formats.get(retroFormat) || UnknownRetro;

  return (
    <Suspense fallback={LOADER}>
      <RetroType archive={archive} {...props} />
    </Suspense>
  );
};

export default React.memo(RetroFormatPicker);
