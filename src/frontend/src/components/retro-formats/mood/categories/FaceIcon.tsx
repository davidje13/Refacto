import React, { memo } from 'react';
import classNames from 'classnames';
import './FaceIcon.less';

type Type = 'happy' | 'meh' | 'sad';

interface Theme {
  name: string;
  icons: Record<Type, string>;
  extraClassName?: string;
}

const THEMES = new Map<string, Theme>();

THEMES.set('faces', {
  name: 'Faces',
  icons: {
    happy: '\uD83D\uDE03',
    meh: '\uD83E\uDD28',
    sad: '\uD83D\uDE22',
  },
});

THEMES.set('cats', {
  name: 'Cats',
  icons: {
    happy: '\uD83D\uDE3A',
    meh: '\uD83D\uDC31',
    sad: '\uD83D\uDE3F',
  },
});

THEMES.set('christmas', {
  name: 'Christmas',
  icons: {
    happy: '\uD83C\uDF85',
    meh: '\u2744\uFE0F',
    sad: '\uD83E\uDD76',
  },
});

THEMES.set('halloween', {
  name: 'Halloween',
  icons: {
    happy: '\uD83D\uDC7B',
    meh: '\uD83C\uDF83',
    sad: '\uD83D\uDC80',
  },
});

THEMES.set('weather', {
  name: 'Weather',
  icons: {
    happy: '\u2600\uFE0F',
    meh: '\u26C5\uFE0F',
    sad: '\u26C8',
  },
});

THEMES.set('hands', {
  name: 'Hands',
  icons: {
    happy: '\uD83D\uDC4D',
    meh: '\uD83E\uDD14',
    sad: '\uD83D\uDC4E',
  },
});

THEMES.set('silly', {
  name: 'Silly',
  icons: {
    happy: '\uD83E\uDD73',
    meh: '\uD83E\uDD16',
    sad: '\uD83D\uDCA9',
  },
});

THEMES.set('boring-faces', {
  name: 'Faces (padded)',
  icons: {
    happy: '\uD83D\uDE03',
    meh: '\uD83E\uDD28',
    sad: '\uD83D\uDE22',
  },
  extraClassName: 'boring',
});

const DEFAULT_THEME = THEMES.values().next().value;

export function getTheme(name: string): Theme {
  return THEMES.get(name) || DEFAULT_THEME;
}

export function getThemes(): [string, Theme][] {
  return [...THEMES.entries()];
}

interface PropsT {
  type: string;
  theme: string;
}

export default memo(({
  theme,
  type,
}: PropsT) => {
  const { icons, extraClassName } = getTheme(theme);
  return (
    <div className={classNames('face-icon', extraClassName)}>
      { icons[type as Type] }
    </div>
  );
});
