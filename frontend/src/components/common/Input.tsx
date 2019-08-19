import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

type Callback<T> = (value: T) => void;

type InheritT = Omit<React.InputHTMLAttributes<HTMLInputElement>, (
  'onChange' |
  'defaultValue' |
  'checked' |
  'defaultChecked'
)>;

type PropsT = InheritT & ({
  type: string;
  value: string;
  onChange?: Callback<string>;
} | {
  type: 'checkbox';
  checked: boolean;
  onChange?: Callback<boolean>;
});

const Input = ({ type, onChange, ...rest }: PropsT): React.ReactElement => {
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
      onChange={changeHandler}
      autoComplete="off"
      {...rest}
    />
  );
};

Input.propTypes = {
  onChange: PropTypes.func,
};

Input.defaultProps = {
  onChange: undefined,
};

export default React.memo(Input);
