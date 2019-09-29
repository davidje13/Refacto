import React, {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useListener from '../../hooks/useListener';
import useDebounced from '../../hooks/useDebounced';
import useMutatedCallback from '../../hooks/useMutatedCallback';
import {
  getEmptyHeight,
  getMultilClassHeights,
  getHeight,
} from '../../helpers/elementMeasurement';
import './Textarea.less';

const NEWLINE = /(\r\n)|(\n\r?)/g;

function sanitiseInput(value: string): string {
  return value.replace(NEWLINE, '\n');
}

interface PropsT extends Omit<
React.TextareaHTMLAttributes<HTMLTextAreaElement>, (
  'onChange' |
  'value' |
  'defaultValue' |
  'defaultChecked'
)> {
  onChange?: (v: string) => void;
  onChangeMultiline?: (v: boolean) => void;
  value?: string;
  sizeToFit: boolean;
  multilineClass?: string;
  multilineClassElement?: HTMLElement | null;
}

const Textarea = ({
  onChange,
  onChangeMultiline,
  value,
  sizeToFit,
  multilineClass,
  multilineClassElement,
  className,
  ...rest
}: PropsT): React.ReactElement => {
  const [height, setHeight] = useState({ multiline: false, pixels: 0 });
  const updateMultiline = useDebounced(onChangeMultiline);
  const baseHeightRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setContentHeight = useCallback((single: number, multi: number) => {
    const baseHeight = baseHeightRef.current;
    const multiline = single > baseHeight;

    setHeight({
      multiline,
      pixels: (multiline ? multi : single) || baseHeight,
    });

    if (updateMultiline) { // TODO TypeScript#16
      updateMultiline(multiline);
    }
  }, [setHeight, baseHeightRef, updateMultiline]);

  const updateSize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !sizeToFit) {
      return;
    }

    if (textarea.value === '') {
      setContentHeight(0, 0);
      return;
    }

    if (multilineClass) {
      const h = getMultilClassHeights(
        textarea,
        multilineClassElement || textarea,
        multilineClass,
      );

      setContentHeight(h.withoutClass, h.withClass);
    } else {
      const h = getHeight(textarea);
      setContentHeight(h, h);
    }
  }, [
    textareaRef,
    setContentHeight,
    multilineClass && multilineClassElement,
    multilineClass,
    sizeToFit,
  ]);

  const changeHandler = useMutatedCallback(onChange, (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): [string] => [sanitiseInput(e.target.value)], []);

  useLayoutEffect(() => {
    baseHeightRef.current = getEmptyHeight(textareaRef.current!);
  }, [textareaRef, baseHeightRef]);
  useLayoutEffect(updateSize, [updateSize, value]);
  useListener(window, 'resize', updateSize);

  const style: Record<string, string> = {};
  if (sizeToFit) {
    style.height = `${height.pixels}px`;
  }

  const extraClassNames: Record<string, boolean> = {};
  if (sizeToFit) {
    extraClassNames['size-to-fit'] = true;
    if (multilineClass && height.multiline && !multilineClassElement) {
      extraClassNames[multilineClass] = true;
    }
  }

  return (
    <textarea
      ref={textareaRef}
      className={classNames(className, extraClassNames)}
      value={value}
      onChange={changeHandler}
      style={style}
      autoComplete="off"
      {...rest}
    />
  );
};

Textarea.propTypes = {
  onChange: PropTypes.func,
  onChangeMultiline: PropTypes.func,
  value: PropTypes.string,
  sizeToFit: PropTypes.bool,
  multilineClass: PropTypes.string,
};

Textarea.defaultProps = {
  onChange: undefined,
  onChangeMultiline: undefined,
  value: '',
  sizeToFit: false,
  multilineClass: undefined,
};

export default Textarea;
