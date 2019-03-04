import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TimeRemaining from './timer/TimeRemaining';
import TimeUp from './timer/TimeUp';
import LiveTimer from '../../../common/LiveTimer';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './MoodItem.less';

export class MoodItem extends React.PureComponent {
  static propTypes = {
    item: propTypesShapeItem.isRequired,
    focused: PropTypes.bool,
    focusedItemTimeout: PropTypes.number,
    onVote: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onSelect: PropTypes.func,
    onAddExtraTime: PropTypes.func,
    onCancel: PropTypes.func,
    onDone: PropTypes.func,
  };

  static defaultProps = {
    focused: false,
    focusedItemTimeout: 0,
    onVote: null,
    onEdit: null,
    onDelete: null,
    onSelect: null,
    onAddExtraTime: null,
    onCancel: null,
    onDone: null,
  };

  constructor(props) {
    super(props);

    this.state = { editing: false };
  }

  handleVote = () => {
    const { item, onVote } = this.props;

    onVote(item.uuid);
  };

  handleBeginEdit = () => {
    this.setState({ editing: true });
  };

  handleCancelEdit = () => {
    this.setState({ editing: false });
  };

  handleSaveEdit = (message) => {
    const { item, onEdit } = this.props;

    this.setState({ editing: false });
    onEdit(item.uuid, message);
  };

  handleDelete = () => {
    const { item, onDelete } = this.props;

    onDelete(item.uuid);
  };

  handleClick = () => {
    const { item, onSelect } = this.props;

    onSelect(item.uuid);
  };

  handleCancelFocus = () => {
    const { item, onCancel } = this.props;

    onCancel(item.uuid);
  };

  handleDone = () => {
    const { item, onDone } = this.props;

    onDone(item.uuid);
  };

  render() {
    const {
      item,
      focused,
      focusedItemTimeout,
      onVote,
      onEdit,
      onDelete,
      onAddExtraTime,
    } = this.props;

    const { editing } = this.state;

    if (editing) {
      const extraOptions = (onDelete === null) ? null : (
        <button
          type="button"
          title="Delete"
          className="delete"
          onClick={this.handleDelete}
        >
          Delete
        </button>
      );

      return (
        <div className="mood-item editing">
          <ExpandingTextEntry
            defaultValue={item.message}
            autoFocus /* eslint-disable-line jsx-a11y/no-autofocus */ // user triggered this
            onSubmit={this.handleSaveEdit}
            onCancel={this.handleCancelEdit}
            extraOptions={extraOptions}
            submitButtonLabel="Save"
            submitButtonTitle="Save changes"
          />
        </div>
      );
    }

    const voteable = (onVote !== null) && !focused;

    const vote = (
      <button
        type="button"
        title={voteable ? 'Agree with this' : `${item.votes} agree with this`}
        className="vote"
        disabled={!voteable}
        onClick={this.handleVote}
      >
        {item.votes}
      </button>
    );

    if (focused) {
      return (
        <div className="mood-item focused">
          <div className="message">{ item.message }</div>
          { vote }
          <button
            type="button"
            title="Cancel"
            className="cancel"
            onClick={this.handleCancelFocus}
          >
            Cancel
          </button>
          <button
            type="button"
            title="Done"
            className="close"
            onClick={this.handleDone}
          >
            Done
          </button>
          <div className="timer">
            <LiveTimer
              targetTime={focusedItemTimeout}
              refreshInterval={1000}
              Counter={TimeRemaining}
              Expired={TimeUp}
              onAddExtraTime={onAddExtraTime}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={classNames('mood-item', { done: item.done })}>
        <button type="button" className="message" onClick={this.handleClick}>
          { item.message }
        </button>
        { vote }
        { (onEdit === null) ? null : (
          <button
            type="button"
            title="Edit"
            className="edit"
            onClick={this.handleBeginEdit}
          />
        ) }
      </div>
    );
  }
}

forbidExtraProps(MoodItem);

export default MoodItem;
