import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { getEmptyHeight, getMultilClassHeights } from '../../helpers/elementMeasurement';
import './ExpandingTextEntry.less';

const NEWLINE = /(\r\n)|(\n\r?)/g;

function sanitiseInput(value: string): string {
  return value.replace(NEWLINE, '\n');
}

function anyModifier(e: React.KeyboardEvent): boolean {
  return (
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.metaKey
  );
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

interface StateT {
  value: string;
  baseHeight: number;
  contentHeight: number;
  contentHeightMultiline: number;
}

class ExpandingTextEntry extends React.PureComponent<PropsT, StateT> {
  public static propTypes = {
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

  public static readonly defaultProps = {
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

  private textareaRef: React.RefObject<HTMLTextAreaElement>;

  public constructor(props: PropsT) {
    super(props);

    const { defaultValue } = props;

    this.state = {
      value: defaultValue,
      baseHeight: 0,
      contentHeight: 0,
      contentHeightMultiline: 0,
    };
    this.textareaRef = React.createRef();
  }

  public componentDidMount(): void {
    window.addEventListener('resize', this.updateSize);

    const textarea = this.textareaRef.current!;
    const baseHeight = getEmptyHeight(textarea);
    this.setState({
      baseHeight,
      contentHeight: baseHeight,
      contentHeightMultiline: baseHeight,
    });

    const { value } = this.state;

    if (value !== '') {
      this.updateSize();
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateSize);
  }

  public updateSize = (): void => {
    const textarea = this.textareaRef.current!;

    if (textarea.value === '') {
      const { baseHeight } = this.state;

      this.setState({
        contentHeight: baseHeight,
        contentHeightMultiline: baseHeight,
      });
    } else {
      const height = getMultilClassHeights(
        textarea,
        textarea.form!,
        'multiline',
      );

      this.setState({
        contentHeight: height.withoutClass,
        contentHeightMultiline: height.withClass,
      });
    }
  };

  public handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    const { onSubmit, clearAfterSubmit } = this.props;
    const { value } = this.state;

    if (value === '') {
      return;
    }

    if (clearAfterSubmit) {
      this.clear();
    }

    onSubmit(sanitiseInput(value));
  };

  public handleCancel = (e: React.SyntheticEvent): void => {
    const { onCancel } = this.props;

    if (onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  public handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ value: e.target.value });
    this.updateSize();
  };

  public handleKey = (e: React.KeyboardEvent): void => {
    if (anyModifier(e)) {
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.handleSubmit(e);
        break;
      case 'Escape':
        this.handleCancel(e);
        break;
      default:
    }
  };

  public focusMe = (e: React.SyntheticEvent): void => {
    const textarea = this.textareaRef.current;
    if (!textarea) {
      return;
    }
    if (e.target === textarea.form) {
      e.stopPropagation();
      e.preventDefault();
      textarea.focus();
    }
  };

  public clear(): void {
    const { baseHeight } = this.state;

    this.setState({
      value: '',
      contentHeight: baseHeight,
      contentHeightMultiline: baseHeight,
    });
  }

  public render(): React.ReactElement {
    const {
      placeholder,
      className,
      submitButtonLabel,
      submitButtonTitle,
      autoFocus,
      extraOptions,
    } = this.props;

    const {
      value,
      baseHeight,
      contentHeight,
      contentHeightMultiline,
    } = this.state;

    const multiline = (extraOptions !== null) || (contentHeight > baseHeight);
    const height = (multiline ? contentHeightMultiline : contentHeight);

    /* eslint-disable jsx-a11y/no-autofocus */ // passthrough
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // form click is assistive
    return (
      <form
        onSubmit={this.handleSubmit}
        onMouseDown={this.focusMe}
        className={classNames('text-entry', className, { multiline })}
      >
        <textarea
          ref={this.textareaRef}
          placeholder={placeholder}
          value={value}
          wrap="soft"
          autoFocus={autoFocus}
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
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
  }
}

forbidExtraProps(ExpandingTextEntry);

export default ExpandingTextEntry;
