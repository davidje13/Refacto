import { useLayoutEffect, useRef, type FunctionComponent } from 'react';
import type { Retro, RetroItem } from '../../shared/api-entities';
import type { AnswerID } from '../../shared/health';
import { classNames } from '../../helpers/classNames';
import { useWindowSize, type Size } from '../../hooks/env/useWindowSize';
import type { Spec } from '../../api/reducer';
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
  { delay, spec: { localState: { [field]: ['=', item.message] } } },
  {
    delay: item.message.length * 60 + 500,
    spec: { items: ['push', item], localState: { [field]: ['=', ''] } },
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
        'health:own-state-0': ['=', { stage: 'answer', user: userID }],
        [`health-progress:${userID}`]: ['=', questionID],
      },
    },
    animation: animate ? 'health-advance' : undefined,
  },
  {
    delay: (animate ? 1700 : 0) + delayAnswer,
    spec: {
      localState: {
        [`health-message:${questionID}:${userID}`]: ['=', message],
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
  localState: { 'health:own-state-0': ['=', { stage: 'discuss' }] },
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
