import React, { useCallback, memo } from 'react';
import classNames from 'classnames';
import './PickerInput.less';

interface OptionT {
  value: string;
  label: React.ReactNode;
}

interface PropsT {
  className?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionT[];
}

export default memo(({ className, name, value, onChange, options }: PropsT) => {
  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        onChange?.(e.target.value);
      }
    },
    [onChange],
  );

  return (
    <div className={classNames('picker-input', className)}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            className="picker-hidden"
            name={name}
            type="radio"
            value={o.value}
            checked={value === o.value}
            onChange={changeHandler}
            autoComplete="off"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
});
