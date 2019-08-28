import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import isFocusable from '../../helpers/isFocusable';
import useKeyHandler from '../../hooks/useKeyHandler';
import useBoxed from '../../hooks/useBoxed';
import Textarea from './Textarea';
import './ExpandingTextEntry.less';

function hasContent(o: React.ReactNode): boolean {
  if (Array.isArray(o)) {
    return o.filter((e) => e).length > 0;
  }
  return Boolean(o);
}

interface PropsT {
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  placeholder: string;
  defaultValue: string;
  autoFocus: boolean;
  forceMultiline: boolean;
  extraOptions?: React.ReactNode;
  extraInputs?: React.ReactNode;
  submitButtonLabel?: React.ReactNode;
  submitButtonTitle?: string;
  clearAfterSubmit: boolean;
}

const ExpandingTextEntry = ({
  onSubmit,
  onCancel,
  placeholder,
  defaultValue,
  autoFocus,
  forceMultiline,
  extraInputs,
  extraOptions,
  submitButtonLabel,
  submitButtonTitle,
  clearAfterSubmit,
}: PropsT): React.ReactElement => {
  const [value, setValue] = useState(defaultValue);
  const [textMultiline, setTextMultiline] = useState(false);
  const boxedValue = useBoxed(value);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  const handleSubmit = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    const curValue = boxedValue.current;
    if (curValue === '') {
      return;
    }

    if (clearAfterSubmit) {
      setValue('');
    }

    onSubmit(curValue);
  }, [boxedValue, onSubmit, clearAfterSubmit, setValue]);

  const handleFormMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFocusable(e.target)) {
      return;
    }
    const formElement = e.currentTarget;
    e.stopPropagation();
    e.preventDefault();
    formElement.querySelector('textarea')!.focus();
  }, []);

  const handleKey = useKeyHandler({
    Enter: handleSubmit,
    Escape: onCancel,
  });

  const alwaysMultiline = forceMultiline || hasContent(extraInputs);

  /* eslint-disable jsx-a11y/no-autofocus */ // passthrough
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // form click is assistive
  return (
    <form
      ref={setForm}
      onSubmit={handleSubmit}
      onMouseDown={handleFormMouseDown}
      className={classNames('text-entry', {
        multiline: alwaysMultiline || textMultiline,
        'has-value': (value !== ''),
      })}
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        wrap="soft"
        autoFocus={autoFocus}
        sizeToFit
        onChange={setValue}
        onChangeMultiline={setTextMultiline}
        multilineClass={alwaysMultiline ? undefined : 'multiline'}
        multilineClassElement={form}
        onKeyDown={handleKey}
      />
      { extraInputs }
      <div className="buttons">
        { extraOptions }
        <button
          type="submit"
          className="submit"
          title={submitButtonTitle}
          disabled={value === ''}
        >
          { submitButtonLabel }
        </button>
      </div>
    </form>
  );
  /* eslint-enable jsx-a11y/no-autofocus */
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
};

ExpandingTextEntry.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  autoFocus: PropTypes.bool,
  forceMultiline: PropTypes.bool,
  extraInputs: PropTypes.node,
  extraOptions: PropTypes.node,
  submitButtonLabel: PropTypes.node,
  submitButtonTitle: PropTypes.string,
  clearAfterSubmit: PropTypes.bool,
};

ExpandingTextEntry.defaultProps = {
  onCancel: null,
  placeholder: '',
  defaultValue: '',
  autoFocus: false,
  forceMultiline: false,
  extraInputs: null,
  extraOptions: null,
  submitButtonLabel: null,
  submitButtonTitle: null,
  clearAfterSubmit: false,
};

forbidExtraProps(ExpandingTextEntry);

export default ExpandingTextEntry;
