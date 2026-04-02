import type { FunctionComponent } from 'react';
import { getThemes } from './categories/FaceIcon';
import { PickerInput } from '../../common/PickerInput';
import { OPTIONS } from '../../../helpers/optionManager';
import type { RetroFormatOptionsProps } from '../formats';

export const MoodOptions: FunctionComponent<RetroFormatOptionsProps> = ({
  retroOptions,
  onChangeOption,
}) => {
  const themeChoices = getThemes().map(([value, detail]) => ({
    value,
    label: (
      <span className="theme-row">
        <span className="name">{detail.name}</span>
        <span className="preview">{detail.icons.happy}</span>
        <span className="preview">{detail.icons.meh}</span>
        <span className="preview">{detail.icons.sad}</span>
      </span>
    ),
  }));

  return (
    <>
      <fieldset className="minimal">
        <legend>Theme</legend>
        <PickerInput
          mode="list"
          className="theme"
          name="theme"
          value={OPTIONS.theme.read(retroOptions)}
          onChange={(theme) => onChangeOption(OPTIONS.theme.write(theme))}
          options={themeChoices}
        />
      </fieldset>
      <h2>Behaviour</h2>
      <label className="checkbox">
        <input
          name="always-show-add-action"
          type="checkbox"
          checked={OPTIONS.alwaysShowAddAction.read(retroOptions)}
          onChange={(e) =>
            onChangeOption(
              OPTIONS.alwaysShowAddAction.write(e.currentTarget.checked),
            )
          }
          autoComplete="off"
        />
        Sticky &ldquo;add action&rdquo; input
      </label>
    </>
  );
};
