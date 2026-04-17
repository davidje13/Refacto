import type { FunctionComponent } from 'react';
import { drawFaceIcon, getThemes } from './categories/FaceIcon';
import { PickerInput } from '../../common/PickerInput';
import type { RetroFormatOptionsProps } from '../formats';
import { optionAlwaysShowAddAction, optionTheme } from './moodOptionKeys';
import './MoodOptions.css';

export const MoodOptions: FunctionComponent<RetroFormatOptionsProps> = ({
  retroOptions,
  onChangeOption,
}) => {
  const themeChoices = getThemes().map(([value, detail]) => ({
    value,
    label: (
      <span className="theme-row">
        <span className="name">{detail.name}</span>
        <span className="preview">{drawFaceIcon(detail.icons.happy)}</span>
        <span className="preview">{drawFaceIcon(detail.icons.meh)}</span>
        <span className="preview">{drawFaceIcon(detail.icons.sad)}</span>
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
          value={optionTheme.read(retroOptions)}
          onChange={(theme) => onChangeOption(optionTheme.specSet(theme))}
          options={themeChoices}
        />
      </fieldset>
      <h2>Behaviour</h2>
      <label className="checkbox">
        <input
          name="always-show-add-action"
          type="checkbox"
          checked={optionAlwaysShowAddAction.read(retroOptions)}
          onChange={(e) =>
            onChangeOption(
              optionAlwaysShowAddAction.specSet(e.currentTarget.checked),
            )
          }
          autoComplete="off"
        />
        Sticky &ldquo;add action&rdquo; input
      </label>
    </>
  );
};
