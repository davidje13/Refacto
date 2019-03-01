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
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
    submitButtonLabel: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    submitButtonTitle: PropTypes.string,
    className: PropTypes.string,
    clearAfterSubmit: PropTypes.bool,
  };

  static defaultProps = {
    placeholder: '',
    defaultValue: '',
    submitButtonLabel: '',
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
    this.setState({ baseHeight });

    this.updateSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  updateSize = () => {
    const textarea = this.textareaRef.current;

    const height = getMultilClassHeights(textarea, textarea.form, 'multiline');

    this.setState({
      contentHeight: height.withoutClass,
      contentHeightMultiline: height.withClass,
    });
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

  handleChange = (e) => {
    this.setState({ value: e.target.value });
    this.updateSize();
  };

  handleKey = (e) => {
    if (e.key === 'Enter' && !anyModifier(e)) {
      this.handleSubmit(e);
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
    } = this.props;

    const {
      value,
      baseHeight,
      contentHeight,
      contentHeightMultiline,
    } = this.state;

    const multiline = (contentHeight > baseHeight);
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
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          style={{ height: `${height}px` }}
        />
        <button
          type="submit"
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
