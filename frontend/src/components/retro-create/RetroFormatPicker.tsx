import type { FunctionComponent, ReactNode } from 'react';
import { PickerInput } from '../common/PickerInput';
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
}) => (
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
);

interface FormatT {
  value: string;
  label: string;
}

const FORMATS: FormatT[] = [{ value: 'mood', label: '3 Column' }];

const FORMAT_OPTIONS = FORMATS.map(({ value, label }) => ({
  value,
  label: (
    <span className="format-item">
      <img className="tile" src={`/formats/${value}.png`} role="presentation" />
      <span className="label">{label}</span>
    </span>
  ),
}));
