import { useLayoutEffect, useRef, type FunctionComponent } from 'react';
import type {
  Colour,
  Curve,
  CurveElement,
  Retro,
  RetroItem,
} from '../../shared/api-entities';
import type { AnswerID } from '../../shared/health';
import { classNames } from '../../helpers/classNames';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import type { Spec } from '../../api/reducer';
import { isoDate } from '../../time/formatters';
import './Preview.css';

interface PreviewFrame {
  delay?: number;
  spec: Spec<PreviewContent>;
  animation?: string | undefined;
}

export type PreviewContent = Partial<
  Omit<Retro, 'items'> & {
    items: Partial<RetroItem>[];
    simulatedTime: number;
    localState: Record<string, unknown>;
    frames: PreviewFrame[];
    loopDelay: number;
  }
>;

interface PropsT {
  content: PreviewContent;
  width?: number;
  height?: number;
  className?: string;
}

export const Preview: FunctionComponent<PropsT> = ({
  content,
  width = 1024,
  height = 680,
  className,
}) => {
  const container = useRef<HTMLElement>(null);
  const windowSize = useWindowSize(getWidth);

  useLayoutEffect(() => {
    const div = container.current;
    if (!div) {
      return;
    }
    div.style.setProperty('--width', String(width));
    div.style.setProperty('--height', String(height));
    div.style.setProperty('--targetw', String(div.clientWidth));
  }, [windowSize, width, height]);

  return (
    <figure
      ref={container}
      className={classNames('preview-container', className)}
    >
      <iframe
        className="preview"
        src={`/preview#${encodeURIComponent(JSON.stringify(content))}`}
        role="img"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </figure>
  );
};

const getWidth = (s: Size) => s.width;

export const vote = (id: string): Spec<PreviewContent> => ({
  items: ['update', ['first', { id: ['=', id] }], { votes: ['+', 1] }],
});

export const moodFocus = (
  oldID: string,
  newID: string,
  now: number,
): Spec<PreviewContent> => ({
  items: ['update', ['first', { id: ['=', oldID] }], { doneTime: ['=', 1] }],
  state: {
    focusedItemId: ['=', newID],
    focusedItemTimeout: ['=', now + 5 * 60 * 1000],
  },
});

export const typeItem = (
  delay: number,
  field: string,
  item: RetroItem,
): PreviewFrame[] => [
  {
    delay,
    spec: { localState: { [field + ':value']: ['=', '...' + item.message] } },
  },
  {
    delay: item.message.length * 60 + 500,
    spec: {
      items: ['push', item],
      localState: { [field + ':value']: ['=', ''] },
    },
  },
];

export const answerHealth = (
  delayOpen: number,
  userID: string,
  questionID: string,
  delayAnswer: number,
  answerID: AnswerID,
  message = '',
  animate = true,
): PreviewFrame[] => [
  {
    delay: delayOpen,
    spec: {
      localState: {
        'health:own-state': ['=', { stage: 'answer', user: userID }],
        [`health-progress:${userID}`]: ['=', questionID],
      },
    },
    animation: animate ? 'health-advance' : undefined,
  },
  {
    delay: (animate ? 1700 : 0) + delayAnswer,
    spec: {
      localState: {
        [`health-message:${questionID}:${userID}`]: ['=', '...' + message],
      },
    },
  },
  {
    delay: message ? message.length * 60 + 500 : 0,
    spec: {
      items: [
        'push',
        {
          id: `${questionID}:${userID}`,
          category: answerID,
          message,
          created: 0,
          attachment: null,
          votes: 0,
          doneTime: 0,
        },
      ],
    },
  },
];

export const healthDiscuss = (): Spec<PreviewContent> => ({
  localState: { 'health:own-state': ['=', { stage: 'discuss' }] },
});

export const healthFocus = (
  questionID: string | null,
): Spec<PreviewContent> => ({
  state: { focusedItemId: ['=', questionID] },
});

export const addHealthAnswers = (
  allAnswers: Record<string, [string, AnswerID, string?][]>,
): Spec<PreviewContent> => ({
  items: [
    'push',
    ...Object.entries(allAnswers).flatMap(([userID, answers]) =>
      answers.map(([questionID, answerID, message = '']) => ({
        id: `${questionID}:${userID}`,
        category: answerID,
        message,
        created: 0,
        attachment: null,
        votes: 0,
        doneTime: 0,
      })),
    ),
  ],
});

export const typeEvent = (
  delay: number,
  field: string,
  item: Pick<RetroItem, 'id' | 'message' | 'doneTime'>,
): PreviewFrame[] => [
  {
    delay,
    spec: { localState: { [field + ':value']: ['=', '...' + item.message] } },
  },
  {
    delay: item.message.length * 60 + 500,
    spec: { localState: { [field + ':date']: ['=', isoDate(item.doneTime)] } },
  },
  {
    delay: 300,
    spec: {
      items: ['push', { category: 'event', ...item }],
      localState: {
        [field + ':value']: ['=', ''],
        [field + ':date']: ['=', ''],
      },
    },
  },
];

export const addEvent = (
  delay: number,
  id: string,
  time: number,
  message: string,
): PreviewFrame => ({
  delay,
  spec: {
    items: [
      'push',
      {
        id,
        category: 'event',
        message,
        created: 0,
        attachment: null,
        votes: 0,
        doneTime: time,
      },
    ],
  },
});

export const TIME_SCALE = 1 / (1000 * 60 * 60);

export const moodline = (
  { id, colour }: { id: string; colour: Colour },
  t: number,
  y0: number,
  ...ys: number[]
): Pick<RetroItem, 'id' | 'category' | 'attachment'> => {
  t *= TIME_SCALE;
  const curve: Curve = [[t, y0 * 10]];
  let prevY = y0;
  let c1 = y0 + (ys[1]! - y0) / 3;
  for (let i = 0; i < ys.length; ++i, t += 72) {
    const y = ys[i]!;
    const nextY = ys[i + 1] ?? y;
    const c2 = y - (nextY - prevY) / 6;
    curve.push([t + 24, c1 * 10, t + 48, c2 * 10, t + 72, y * 10]);
    prevY = y;
    c1 = y * 2 - c2;
  }
  return {
    id,
    category: 'moodline',
    attachment: { type: 'sketch', colour, curve },
  };
};

export const drawMoodLine = (
  delay: number,
  segmentDelay: number,
  item: Pick<RetroItem, 'id' | 'attachment'>,
  { dx = 0, dy = 0, mx = 1, my = 1 } = {},
): PreviewFrame[] => {
  if (item.attachment?.type !== 'sketch') {
    throw new Error();
  }
  const move = (c: CurveElement) =>
    c.map((p, i) => p * (i & 1 ? my : mx) + (i & 1 ? dy : dx)) as CurveElement;
  const [c0, ...curve] = item.attachment.curve;
  return [
    {
      delay,
      spec: {
        items: [
          'push',
          {
            category: 'moodline',
            message: '',
            created: 0,
            votes: 0,
            doneTime: 0,
            ...item,
            attachment: { ...item.attachment, curve: [move(c0!)] },
          },
        ],
      },
    },
    ...curve.map(
      (seg): PreviewFrame => ({
        delay: segmentDelay,
        spec: {
          items: [
            'update',
            ['first', { id: ['=', item.id] }],
            { attachment: { curve: ['push', move(seg)] } },
          ],
        },
      }),
    ),
  ];
};
