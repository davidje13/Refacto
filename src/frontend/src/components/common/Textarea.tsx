import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
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

interface PropsT
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'value' | 'defaultValue' | 'defaultChecked'
  > {
  onChange?: (v: string) => void;
  onChangeMultiline?: (v: boolean) => void;
  value?: string;
  sizeToFit?: boolean;
  multilineClass?: string;
  multilineClassElement?: HTMLElement | null;
  className?: string;
}

export default ({
  onChange,
  onChangeMultiline,
  value = '',
  sizeToFit = false,
  multilineClass,
  multilineClassElement,
  className,
  ...rest
}: PropsT): React.ReactElement => {
  const [height, setHeight] = useState({ multiline: false, pixels: 0 });
  const updateMultiline = useDebounced(onChangeMultiline);
  const baseHeightRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setContentHeight = useCallback(
    (single: number, multi: number) => {
      const baseHeight = baseHeightRef.current;
      const multiline = single > baseHeight;

      setHeight({
        multiline,
        pixels: (multiline ? multi : single) || baseHeight,
      });

      updateMultiline?.(multiline);
    },
    [setHeight, baseHeightRef, updateMultiline],
  );

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

  const changeHandler = useMutatedCallback(
    onChange,
    (e: React.ChangeEvent<HTMLTextAreaElement>): [string] => [
      sanitiseInput(e.target.value),
    ],
    [],
  );

  useLayoutEffect(() => {
    baseHeightRef.current = getEmptyHeight(textareaRef.current!);
  }, [textareaRef, baseHeightRef]);
  useLayoutEffect(updateSize, [updateSize, value]);
  useListener(window, 'resize', updateSize);

  const style: React.CSSProperties = {};
  if (sizeToFit) {
    // +1 as Chrome seems to add an extra pixel now from somewhere when rendering,
    // so we must avoid the scrollbar appearing (presumably due to some rounding)
    style.height = `${height.pixels + 1}px`;
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
