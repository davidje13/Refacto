import React, { useCallback } from 'react';

type Callback<T> = (value: T) => void;

type InheritT = Omit<React.InputHTMLAttributes<HTMLInputElement>, (
  'onChange' |
  'value' |
  'defaultValue' |
  'checked' |
  'defaultChecked'
)>;

type PropsT = InheritT & ({
  type: string;
  value: string;
  selected?: never;
  checked?: never;
  onChange?: Callback<string>;
} | {
  type: 'radio';
  value: string;
  selected: string;
  checked?: never;
  onChange?: Callback<string>;
} | {
  type: 'checkbox';
  value?: never;
  selected?: never;
  checked: boolean;
  onChange?: Callback<boolean>;
});

const Input = ({
  type,
  value,
  selected,
  checked,
  onChange,
  ...rest
}: PropsT): React.ReactElement => {
  const changeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) {
      return;
    }
    const o = e.target;
    if (type === 'checkbox') {
      (onChange as Callback<boolean>)(o.checked);
    } else if (type === 'radio') {
      if (o.checked) {
        (onChange as Callback<string>)(o.value);
      }
    } else {
      (onChange as Callback<string>)(o.value);
    }
  }, [type, onChange]);

  return (
    <input
      type={type}
      value={value}
      checked={type === 'radio' ? (selected === value) : checked}
      onChange={changeHandler}
      autoComplete="off"
      {...rest}
    />
  );
};

Input.defaultProps = {
  onChange: undefined,
};

export default React.memo(Input);
