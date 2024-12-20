import { memo } from 'react';
import { classNames } from '../../../../helpers/classNames';
import './FaceIcon.css';

type Type = 'happy' | 'meh' | 'sad';

interface Theme {
  name: string;
  icons: Record<Type, string>;
  extraClassName?: string;
}

const THEMES = new Map<string, Theme>();

const FEMALE = '\u200D\u2640';
const MALE = '\u200D\u2642';

const DEFAULT_THEME: Theme = {
  name: 'Faces',
  icons: {
    happy: '\uD83D\uDE03',
    meh: '\uD83E\uDD28',
    sad: '\uD83D\uDE22',
  },
};

THEMES.set('faces', DEFAULT_THEME);

THEMES.set('intense', {
  name: 'Intense',
  icons: {
    happy: '\uD83E\uDD29',
    meh: '\uD83D\uDE11',
    sad: '\uD83E\uDD2F',
  },
});

THEMES.set('symbols', {
  name: 'Symbols',
  icons: {
    happy: '\uD83C\uDF89',
    meh: '\u2753',
    sad: '\uD83D\uDCA5',
  },
});

THEMES.set('cats', {
  name: 'Cats',
  icons: {
    happy: '\uD83D\uDE3B',
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
    sad: '\u26C8\uFE0F',
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

THEMES.set('body', {
  name: 'Body Parts',
  icons: {
    happy: '\uD83D\uDCAA',
    meh: '\uD83D\uDC40',
    sad: '\uD83E\uDEE5',
  },
});

THEMES.set('gestures-a', {
  name: 'Gestures (A)',
  icons: {
    happy: `\uD83D\uDE46${FEMALE}`,
    meh: `\uD83E\uDD37${MALE}`,
    sad: `\uD83E\uDD26${FEMALE}`,
  },
});

THEMES.set('gestures-b', {
  name: 'Gestures (B)',
  icons: {
    happy: `\uD83D\uDE46${MALE}`,
    meh: `\uD83E\uDD37${FEMALE}`,
    sad: `\uD83E\uDD26${MALE}`,
  },
});

THEMES.set('poses', {
  name: 'Poses',
  icons: {
    happy: '\uD83E\uDD38',
    meh: '\uD83E\uDDD8',
    sad: '\uD83E\uDDCE',
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

export const FaceIcon = memo(({ theme, type }: PropsT) => {
  const { icons, extraClassName } = getTheme(theme);
  return (
    <div className={classNames('face-icon', extraClassName)}>
      {icons[type as Type]}
    </div>
  );
});
