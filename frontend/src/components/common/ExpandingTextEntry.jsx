import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { getEmptyHeight, getMultilClassHeights } from '../../helpers/elementMeasurement';
import './ExpandingTextEntry.less';

const NEWLINE = /(\r\n)|(\n\r?)/g;

function sanitiseInput(value) {
  return value.replace(NEWLINE, '\n');
}

function anyModifier(e) {
  return (
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.metaKey
  );
}

export class ExpandingTextEntry extends React.PureComponent {
  static propTypes = {
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

  static defaultProps = {
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

  constructor(props) {
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

  componentDidMount() {
    window.addEventListener('resize', this.updateSize);

    const textarea = this.textareaRef.current;
    const baseHeight = getEmptyHeight(textarea);
    this.setState({
      baseHeight,
      contentHeight: baseHeight,
      contentHeightMultiline: baseHeight,
    });

    if (this.state.value !== '') {
      this.updateSize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  updateSize = () => {
    const textarea = this.textareaRef.current;

    if (textarea.value === '') {
      const { baseHeight } = this.state;

      this.setState({
        contentHeight: baseHeight,
        contentHeightMultiline: baseHeight,
      });
    } else {
      const height = getMultilClassHeights(textarea, textarea.form, 'multiline');

      this.setState({
        contentHeight: height.withoutClass,
        contentHeightMultiline: height.withClass,
      });
    }
  };

  handleSubmit = (e) => {
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

  handleCancel = (e) => {
    const { onCancel } = this.props;

    if (onCancel !== null) {
      e.preventDefault();
      onCancel();
    }
  };

  handleChange = (e) => {
    this.setState({ value: e.target.value });
    this.updateSize();
  };

  handleKey = (e) => {
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

  clear() {
    const { baseHeight } = this.state;

    this.setState({
      value: '',
      contentHeight: baseHeight,
      contentHeightMultiline: baseHeight,
    });
  }

  render() {
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

    return (
      <form
        onSubmit={this.handleSubmit}
        className={classNames('text-entry', className, { multiline })}
      >
        <textarea
          ref={this.textareaRef}
          placeholder={placeholder}
          value={value}
          wrap="soft"
          autoFocus={autoFocus} /* eslint-disable-line jsx-a11y/no-autofocus */ // passthrough
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          style={{ height: `${height}px` }}
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
  }
}

forbidExtraProps(ExpandingTextEntry);

export default ExpandingTextEntry;
