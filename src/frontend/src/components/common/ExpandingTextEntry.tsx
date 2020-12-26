import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import isFocusable from '../../helpers/isFocusable';
import useKeyHandler from '../../hooks/useKeyHandler';
import useStateMap from '../../hooks/useStateMap';
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
  placeholder?: string;
  defaultValue?: string;
  identifier?: string;
  autoFocus?: boolean;
  forceMultiline?: boolean;
  preSubmitOptions?: React.ReactNode;
  postSubmitOptions?: React.ReactNode;
  extraInputs?: React.ReactNode;
  submitButtonLabel?: React.ReactNode;
  submitButtonTitle?: string;
  clearAfterSubmit?: boolean;
  blurOnSubmit?: boolean;
  blurOnCancel?: boolean;
}

export default ({
  onSubmit,
  onCancel,
  placeholder = '',
  defaultValue = '',
  identifier,
  autoFocus = false,
  forceMultiline = false,
  extraInputs,
  preSubmitOptions,
  postSubmitOptions,
  submitButtonLabel,
  submitButtonTitle,
  clearAfterSubmit = false,
  blurOnSubmit = false,
  blurOnCancel = false,
}: PropsT): React.ReactElement => {
  const [value, setValue] = useStateMap(identifier, 'value', defaultValue);
  const [textMultiline, setTextMultiline] = useState(false);
  const boxedValue = useBoxed(value);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  const blurElement = useCallback(() => {
    const element = document.activeElement;
    if (element instanceof HTMLElement) {
      element.blur();
    }
  }, []);

  const handleSubmit = useCallback((e?: React.SyntheticEvent) => {
    e?.preventDefault();

    const curValue = boxedValue.current;
    if (curValue === '') {
      return;
    }

    if (blurOnSubmit) {
      blurElement();
    }
    if (clearAfterSubmit) {
      setValue('');
    }

    onSubmit(curValue);
  }, [boxedValue, onSubmit, blurOnSubmit, blurElement, clearAfterSubmit, setValue]);

  const handleCancel = useCallback(() => {
    if (blurOnCancel) {
      blurElement();
    }
    onCancel?.();
  }, [blurOnCancel, blurElement, onCancel]);

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
    Escape: handleCancel,
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
        { preSubmitOptions }
        <button
          type="submit"
          className="submit"
          title={submitButtonTitle}
          disabled={value === ''}
        >
          { submitButtonLabel }
        </button>
        { postSubmitOptions }
      </div>
    </form>
  );
  /* eslint-enable jsx-a11y/no-autofocus */
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
};
