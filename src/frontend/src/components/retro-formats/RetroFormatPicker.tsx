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

interface PropsT extends ChildPropsT {
  retroFormat: string;
}

const formats = new Map<string, React.ComponentType<ChildPropsT>>();
formats.set('mood', React.lazy(() => import('./mood/MoodRetro')));

const LOADER = (
  <div className="loader">Loading&hellip;</div>
);

const RetroFormatPicker = ({ retroFormat, ...props }: PropsT): React.ReactElement => {
  const RetroType = formats.get(retroFormat) || UnknownRetro;

  return (
    <Suspense fallback={LOADER}>
      <RetroType {...props} />
    </Suspense>
  );
};

RetroFormatPicker.defaultProps = {
  dispatch: undefined,
  onComplete: undefined,
  archive: false,
  archiveTime: undefined,
};

export default React.memo(RetroFormatPicker);
