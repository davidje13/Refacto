import { lazy, type ComponentType, type SVGAttributes } from 'react';
import type {
  RetroAuth,
  RetroHistoryItem,
  RetroItem,
} from '@refacto/shared/api-entities';
import HealthIcon from '../../../resources/icons/health.svg';
import MoodIcon from '../../../resources/icons/mood.svg';
import TimelineIcon from '../../../resources/icons/timeline.svg';
import UnknownIcon from '../../../resources/icons/unknown.svg';
import type { RetroDispatch } from '../../api/RetroTracker';
import type { Spec } from '../../api/reducer';
import { lazyImportError } from '../common/Loader';
import { UnknownRetro } from './unknown/UnknownRetro';

export interface RetroFormatProps<StateT = Record<string, unknown>> {
  className?: string;
  retroId: string;
  retroSlug: string;
  retroAuth?: RetroAuth | undefined;
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: StateT;
  retroHistory: RetroHistoryItem[];
  group?: string | undefined;
  dispatch?: RetroDispatch | undefined;
  onArchive?: (() => void) | undefined;
  onInvite?: (() => void) | undefined;
  settingsLink?: string | undefined;
  archivesLink?: string | undefined;
  archive: boolean;
  archiveTime?: number;
}

export interface RetroFormatOptionsProps {
  retroOptions: Record<string, unknown>;
  onChangeOption: (spec: Spec<Record<string, unknown>>) => void;
}

export interface RetroFormatDetails {
  component: ComponentType<RetroFormatProps>;
  options?: ComponentType<RetroFormatOptionsProps>;
  label: string;
  icon: ComponentType<SVGAttributes<SVGSVGElement> & { title?: string }>;
  showCreateArchive: boolean;
}

export const RETRO_FORMATS = new Map<string, RetroFormatDetails>([
  [
    'mood',
    {
      component: lazy(() =>
        import('./mood/index').then(
          (m) => ({ default: m.MoodRetro }),
          lazyImportError,
        ),
      ),
      options: lazy(() =>
        import('./mood/index').then(
          (m) => ({ default: m.MoodOptions }),
          lazyImportError,
        ),
      ),
      label: '3 Column',
      icon: MoodIcon,
      showCreateArchive: true,
    },
  ],
  [
    'health',
    {
      component: lazy(() =>
        import('./health/index').then(
          (m) => ({ default: m.HealthRetro }),
          lazyImportError,
        ),
      ),
      options: lazy(() =>
        import('./health/index').then(
          (m) => ({ default: m.HealthOptions }),
          lazyImportError,
        ),
      ),
      label: 'Health Check',
      icon: HealthIcon,
      showCreateArchive: false,
    },
  ],
  [
    'timeline',
    {
      component: lazy(() =>
        import('./timeline/index').then(
          (m) => ({ default: m.TimelineRetro }),
          lazyImportError,
        ),
      ),
      label: 'Timeline',
      icon: TimelineIcon,
      showCreateArchive: true,
    },
  ],
]);

const UNKNOWN: RetroFormatDetails = {
  component: UnknownRetro,
  label: 'Unknown',
  icon: UnknownIcon,
  showCreateArchive: false,
};

export const getRetroFormatDetails = (format: string) =>
  RETRO_FORMATS.get(format) ?? UNKNOWN;
