import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './MoodItem.less';

export class MoodItem extends React.PureComponent {
  static propTypes = {
    item: propTypesShapeItem.isRequired,
    focused: PropTypes.bool,
    onVote: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    focused: false,
    onVote: null,
    onEdit: null,
    onDelete: null,
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

  render() {
    const {
      item,
      focused,
      onVote,
      onEdit,
      onDelete,
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

    return (
      <div className={classNames('mood-item', { done: item.done, focused })}>
        <div className="message">{item.message}</div>
        <button
          type="button"
          title="Agree with this"
          className="vote"
          disabled={onVote === null}
          onClick={this.handleVote}
        >
          {item.votes}
        </button>
        { (onEdit === null) ? null : (
          <button
            type="button"
            title="Edit this"
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
