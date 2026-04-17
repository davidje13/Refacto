import { OptionType } from '../../../helpers/OptionType';

export const optionAlwaysShowAddAction = new OptionType<boolean>(
  'always-show-add-action',
  true,
);

export const optionTheme = new OptionType<string>('theme', 'faces');
