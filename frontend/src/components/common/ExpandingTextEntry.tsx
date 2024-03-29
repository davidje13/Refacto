import {
  useState,
  useCallback,
  ReactNode,
  ReactElement,
  SyntheticEvent,
  MouseEvent,
} from 'react';
import classNames from 'classnames';
import { isFocusable } from '../../helpers/isFocusable';
import { useKeyHandler } from '../../hooks/useKeyHandler';
import { useStateMap } from '../../hooks/useStateMap';
import { useBoxed } from '../../hooks/useBoxed';
import { Textarea } from './Textarea';
import './ExpandingTextEntry.less';

function hasContent(o: ReactNode): boolean {
  if (Array.isArray(o)) {
    return o.filter((e) => e).length > 0;
  }
  return Boolean(o);
}

interface PropsT {
  onSubmit: (value: string) => void;
  onCancel?: (() => void) | undefined;
  placeholder?: string;
  defaultValue?: string;
  identifier?: string | undefined;
  autoFocus?: boolean;
  forceMultiline?: boolean;
  preSubmitOptions?: ReactNode;
  postSubmitOptions?: ReactNode;
  extraInputs?: ReactNode;
  submitButtonLabel?: ReactNode;
  submitButtonTitle?: string;
  clearAfterSubmit?: boolean;
  blurOnSubmit?: boolean;
  blurOnCancel?: boolean;
}

export const ExpandingTextEntry = ({
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
}: PropsT): ReactElement => {
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

  const handleSubmit = useCallback(
    (e?: SyntheticEvent) => {
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
    },
    [
      boxedValue,
      onSubmit,
      blurOnSubmit,
      blurElement,
      clearAfterSubmit,
      setValue,
    ],
  );

  const handleCancel = useCallback(() => {
    if (blurOnCancel) {
      blurElement();
    }
    onCancel?.();
  }, [blurOnCancel, blurElement, onCancel]);

  const handleFormMouseDown = useCallback((e: MouseEvent) => {
    if (isFocusable(e.target)) {
      return;
    }
    const formElement = e.currentTarget;
    e.stopPropagation();
    e.preventDefault();
    formElement.querySelector('textarea')?.focus();
  }, []);

  const handleKey = useKeyHandler({
    Enter: handleSubmit,
    Escape: handleCancel,
  });

  const alwaysMultiline = forceMultiline || hasContent(extraInputs);

  return (
    <form
      ref={setForm}
      onSubmit={handleSubmit}
      onMouseDown={handleFormMouseDown}
      className={classNames('text-entry', {
        multiline: alwaysMultiline || textMultiline,
        'has-value': value !== '',
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
        multilineClass={alwaysMultiline ? null : 'multiline'}
        multilineClassElement={form}
        onKeyDown={handleKey}
      />
      {extraInputs}
      <div className="buttons">
        {preSubmitOptions}
        <button
          type="submit"
          className="submit"
          title={submitButtonTitle}
          disabled={value === ''}
        >
          {submitButtonLabel}
        </button>
        {postSubmitOptions}
      </div>
    </form>
  );
};
