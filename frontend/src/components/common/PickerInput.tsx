import { memo, type ReactNode } from 'react';
import { classNames } from '../../helpers/classNames';
import './PickerInput.css';

interface OptionT {
  value: string;
  label: ReactNode;
}

interface PropsT {
  className?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionT[];
}

export const PickerInput = memo(
  ({ className, name, value, onChange, options }: PropsT) => (
    <div className={classNames('picker-input', className)}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            className="picker-hidden"
            name={name}
            type="radio"
            value={o.value}
            checked={value === o.value}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                onChange?.(o.value);
              }
            }}
            autoComplete="off"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  ),
);
