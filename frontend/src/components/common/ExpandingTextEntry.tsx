import React, {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { getEmptyHeight, getMultilClassHeights } from '../../helpers/elementMeasurement';
import useListener from '../../hooks/useListener';
import useKeyHandler from '../../hooks/useKeyHandler';
import './ExpandingTextEntry.less';

const NEWLINE = /(\r\n)|(\n\r?)/g;

function sanitiseInput(value: string): string {
  return value.replace(NEWLINE, '\n');
}

interface PropsT {
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  placeholder: string;
  defaultValue: string;
  autoFocus: boolean;
  extraOptions?: React.ReactNode;
  submitButtonLabel?: React.ReactNode;
  submitButtonTitle?: string;
  className?: string;
  clearAfterSubmit: boolean;
}

const ExpandingTextEntry = ({
  onSubmit,
  onCancel,
  placeholder,
  defaultValue,
  autoFocus,
  extraOptions,
  submitButtonLabel,
  submitButtonTitle,
  className,
  clearAfterSubmit,
}: PropsT): React.ReactElement => {
  const [value, setValue] = useState(defaultValue);
  const [baseHeight, setBaseHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState({ single: 0, multiline: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateSize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    if (textarea.value === '') {
      setContentHeight({ single: 0, multiline: 0 });
    } else {
      const height = getMultilClassHeights(
        textarea,
        textarea.form!,
        'multiline',
      );

      setContentHeight({
        single: height.withoutClass,
        multiline: height.withClass,
      });
    }
  }, [textareaRef, setContentHeight]);

  const clear = useCallback(() => {
    setValue('');
    setContentHeight({ single: 0, multiline: 0 });
  }, [setValue, setContentHeight]);

  const handleSubmit = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const curValue = textarea.value;
    if (curValue === '') {
      return;
    }

    if (clearAfterSubmit) {
      clear();
    }

    onSubmit(sanitiseInput(curValue));
  }, [textareaRef, onSubmit, clearAfterSubmit, clear]);

  const focusMe = useCallback((e: React.SyntheticEvent) => {
    const textarea = textareaRef.current;
    if (textarea && e.target === textarea.form) {
      e.stopPropagation();
      e.preventDefault();
      textarea.focus();
    }
  }, [textareaRef]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, [setValue]);

  const handleKey = useKeyHandler({
    Enter: handleSubmit,
    Escape: onCancel,
  });

  useLayoutEffect(() => {
    setBaseHeight(getEmptyHeight(textareaRef.current!));
  }, [textareaRef, setBaseHeight, setContentHeight]);

  useLayoutEffect(updateSize, [updateSize, value]);

  useListener(window, 'resize', updateSize);

  const multiline = (extraOptions !== null) || (contentHeight.single > baseHeight);
  const height = Math.max(
    multiline ? contentHeight.multiline : contentHeight.single,
    baseHeight,
  );

  /* eslint-disable jsx-a11y/no-autofocus */ // passthrough
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // form click is assistive
  return (
    <form
      onSubmit={handleSubmit}
      onMouseDown={focusMe}
      className={classNames('text-entry', className, { multiline })}
    >
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        wrap="soft"
        autoFocus={autoFocus}
        onChange={handleChange}
        onKeyDown={handleKey}
        style={{ height: `${height}px` }}
        autoComplete="off"
      />
      { extraOptions }
      <button
        type="submit"
        className="submit"
        title={submitButtonTitle}
        disabled={value === ''}
      >
        { submitButtonLabel }
      </button>
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
  extraOptions: PropTypes.node,
  submitButtonLabel: PropTypes.node,
  submitButtonTitle: PropTypes.string,
  className: PropTypes.string,
  clearAfterSubmit: PropTypes.bool,
};

ExpandingTextEntry.defaultProps = {
  onCancel: null,
  placeholder: '',
  defaultValue: '',
  autoFocus: false,
  extraOptions: null,
  submitButtonLabel: null,
  submitButtonTitle: null,
  className: null,
  clearAfterSubmit: false,
};

forbidExtraProps(ExpandingTextEntry);

export default ExpandingTextEntry;
