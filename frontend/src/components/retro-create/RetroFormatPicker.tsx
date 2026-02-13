import type { FunctionComponent, ReactNode } from 'react';
import { PickerInput } from '../common/PickerInput';
import { RETRO_FORMATS } from '../retro-formats/formats';
import './RetroFormatPicker.css';

interface PropsT {
  legend?: ReactNode;
  value: string;
  onChange: (value: string) => void;
}

export const RetroFormatPicker: FunctionComponent<PropsT> = ({
  legend = 'Format',
  value,
  onChange,
}) =>
  FORMAT_OPTIONS.length > 1 ? (
    <fieldset className="minimal">
      <legend>{legend}</legend>
      <PickerInput
        mode="tiles"
        className="retro-format-picker"
        name="format"
        value={value}
        onChange={onChange}
        options={FORMAT_OPTIONS}
      />
    </fieldset>
  ) : null;

const FORMAT_OPTIONS = [...RETRO_FORMATS.entries()].map(
  ([value, { label }]) => ({
    value,
    label: (
      <span className="format-item">
        <img
          className="tile"
          src={`/formats/${value}.png`}
          role="presentation"
        />
        <span className="label">{label}</span>
      </span>
    ),
  }),
);
