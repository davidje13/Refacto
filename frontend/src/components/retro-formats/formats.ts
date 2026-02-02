import { lazy, type ComponentType, type SVGAttributes } from 'react';
import MoodIcon from '../../../resources/icons/mood.svg';
import UnknownIcon from '../../../resources/icons/unknown.svg';
import type { RetroItem } from '../../shared/api-entities';
import type { RetroDispatch } from '../../api/RetroTracker';
import { UnknownRetro } from './unknown/UnknownRetro';

export interface RetroFormatProps {
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

export interface RetroFormatDetails {
  component: ComponentType<RetroFormatProps>;
  label: string;
  icon: ComponentType<SVGAttributes<SVGSVGElement> & { title?: string }>;
}

export const RETRO_FORMATS = new Map<string, RetroFormatDetails>([
  [
    'mood',
    {
      component: lazy(() =>
        import('./mood/MoodRetro').then((m) => ({ default: m.MoodRetro })),
      ),
      label: '3 Column',
      icon: MoodIcon,
    },
  ],
]);

const UNKNOWN: RetroFormatDetails = {
  component: UnknownRetro,
  label: 'Unknown',
  icon: UnknownIcon,
};

export const getRetroFormatDetails = (format: string) =>
  RETRO_FORMATS.get(format) ?? UNKNOWN;
