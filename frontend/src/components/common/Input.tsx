import { memo, InputHTMLAttributes } from 'react';

type Callback<T> = (value: T) => void;

type InheritT = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'defaultValue' | 'checked' | 'defaultChecked'
>;

type PropsT = InheritT &
  (
    | {
        type: string;
        value: string;
        selected?: never;
        checked?: never;
        onChange?: Callback<string>;
      }
    | {
        type: 'radio';
        value: string;
        selected: string;
        checked?: never;
        onChange?: Callback<string>;
      }
    | {
        type: 'checkbox';
        value?: never;
        selected?: never;
        checked: boolean;
        onChange?: Callback<boolean>;
      }
  );

export const Input = memo(
  ({
    type,
    value,
    selected,
    autoComplete = 'off',
    checked,
    onChange,
    ...rest
  }: PropsT) => (
    <input
      type={type}
      value={value}
      checked={type === 'radio' ? selected === value : checked}
      onChange={(e) => {
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
      }}
      autoComplete={autoComplete}
      {...rest}
    />
  ),
);
