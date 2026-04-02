import { memo } from 'react';
import { classNames } from '../../../../helpers/classNames';
import './FaceIcon.css';

export type MoodType = 'happy' | 'meh' | 'sad';

interface Theme {
  name: string;
  icons: Record<MoodType, string>;
  extraClassName?: string;
}

const THEMES = new Map<string, Theme>(
  [
    'faces:Faces:😃:🤨:😢',
    'hands:Hands:👍s:🤔:👎s',
    'intense:Intense:🤩:😑:😵',
    'silly:Silly:🥳:🤖:🤯',
    'symbols:Symbols:🎉:❓:💥',
    'cats:Cats:😻:🐱:😿',
    'weather:Weather:☀️:⛅️:⛈️',
    'body:Body Parts:💪s:👀:🫥',
    'fantasy:Fantasy:🦄:🔮:🧌',
    'nature:Nature:💐:🌱:🪾',
    'space:Space:🚀:⭐:☄',
    'cards:Cards:♠:🎴:🃏',
    'gestures:Gestures:🙆s:🤷s:🤦s',
    'poses:Poses:🤸s:🧘s:🧎s',

    'new-year:New Year:✨:🪩:💥',
    'chinese-new-year:☯\uFE0F Chinese New Year:🧧:🏮:🐲',
    'eid:☪\uFE0F Eid al-Fitr:🕋:🕌:🌅',
    'easter:✝\uFE0F Easter:🐣:🐇:🥚',
    'pride:Pride:🏳️‍🌈:🏳️‍⚧️:🏴‍☠️',
    'halloween:✝\uFE0F Halloween:👻:🎃:💀',
    'day-of-the-dead:Day of the Dead:🌼:💀:🥀',
    'diwali:🕉 Diwali:🎇:🪔:🕯',
    'hanukkah:✡\uFE0F Hanukkah:🕎:🕍:🕯',
    'christmas:✝\uFE0F Christmas:🎅s:❄️:🥶',
  ].map((v) => {
    const [id, name, happy, meh, sad] = v.split(':') as [
      string,
      string,
      string,
      string,
      string,
    ];
    return [id, { name, icons: { happy, meh, sad } }];
  }),
);
const THEME_ALIAS = new Map([
  ['gestures-a', 'gestures'],
  ['gestures-b', 'gestures'],
]);

const DEFAULT_THEME = THEMES.get('faces')!;

THEMES.set('boring-faces', {
  name: 'Faces (padded)',
  icons: DEFAULT_THEME.icons,
  extraClassName: 'boring',
});

export const getThemes = (): [string, Theme][] => [...THEMES.entries()];

interface PropsT {
  type: MoodType;
  theme: string;
}

export const drawFaceIcon = (icon: string, skinTone = '') =>
  icon.replace('s', skinTone) + '\uFE0F';

export const FaceIcon = memo(({ theme, type }: PropsT) => {
  const { icons, extraClassName } =
    THEMES.get(THEME_ALIAS.get(theme) ?? theme) ?? DEFAULT_THEME;
  return (
    <div className={classNames('face-icon', extraClassName)}>
      {drawFaceIcon(icons[type], '')}
    </div>
  );
});
