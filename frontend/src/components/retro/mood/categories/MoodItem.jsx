import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './MoodItem.less';

export class MoodItem extends React.PureComponent {
  static propTypes = {
    item: propTypesShapeItem.isRequired,
    focused: PropTypes.bool,
    onVote: PropTypes.func,
  };

  static defaultProps = {
    focused: false,
    onVote: null,
  };

  handleVote = () => {
    const { item: { uuid }, onVote } = this.props;

    onVote(uuid);
  };

  render() {
    const {
      item: {
        message,
        votes = 0,
        done = false,
      },
      focused,
      onVote,
    } = this.props;

    return (
      <div className={classNames('mood-item', { done, focused })}>
        <div className="message">{message}</div>
        <button
          type="button"
          title="Agree with this"
          className="vote"
          disabled={onVote === null}
          onClick={this.handleVote}
        >
          {votes}
        </button>
      </div>
    );
  }
}

forbidExtraProps(MoodItem);

export default MoodItem;
