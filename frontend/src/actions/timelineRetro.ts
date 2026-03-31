import type { Spec } from '../api/reducer';
import type { Colour, Curve, Retro } from '../shared/api-entities';
import { setRetroState } from './retro';

export interface TimelineRetroStateT {
  startTime?: number;
  endTime?: number;
}

export const setStartTime = (
  group: string | undefined,
  time: number,
): Spec<Retro>[] => setRetroState(group, { startTime: time });

export const setEndTime = (
  group: string | undefined,
  time: number,
): Spec<Retro>[] => setRetroState(group, { endTime: time });

export const addPath = (
  group: string | undefined,
  id: string,
  colour: Colour,
  curve: Curve,
): Spec<Retro>[] => [
  {
    items: [
      'update',
      ['first', { id: ['=', id] }],
      { attachment: { curve: ['push', ...curve] } },
      {
        id,
        category: 'moodline',
        message: '',
        votes: 0,
        created: Date.now(),
        doneTime: 0,
        group,
        attachment: { type: 'sketch', curve: [], colour },
      },
    ],
  },
];

export const updatePath = (id: string, spec: Spec<Curve>): Spec<Retro>[] => [
  {
    items: [
      'update',
      ['first', { id: ['=', id] }],
      { attachment: { curve: spec } },
    ],
  },
];
