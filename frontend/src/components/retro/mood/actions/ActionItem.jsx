import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ItemEditing from '../ItemEditing';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './ActionItem.less';

export class ActionItem extends React.PureComponent {
  static propTypes = {
    item: propTypesShapeItem.isRequired,
    onSetDone: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    onSetDone: null,
    onEdit: null,
    onDelete: null,
  };

  constructor(props) {
    super(props);

    this.state = { editing: false };

    this.handleDoneFalse = this.handleSetDone.bind(this, false);
    this.handleDoneTrue = this.handleSetDone.bind(this, true);
  }

  handleSetDone = (done) => {
    const { item, onSetDone } = this.props;

    onSetDone(item.uuid, done);
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
      onSetDone,
      onEdit,
      onDelete,
    } = this.props;

    const { editing } = this.state;

    if (editing) {
      return (
        <ItemEditing
          className="action-item"
          message={item.message}
          onSubmit={this.handleSaveEdit}
          onCancel={this.handleCancelEdit}
          onDelete={onDelete === null ? null : this.handleDelete}
        />
      );
    }

    return (
      <div className={classNames('action-item', { done: item.done })}>
        <div className="message">{item.message}</div>
        <button
          type="button"
          title={item.done ? 'Mark as not done' : 'Mark as done'}
          className="toggle-done"
          disabled={onSetDone === null}
          onClick={item.done ? this.handleDoneFalse : this.handleDoneTrue}
        />
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

forbidExtraProps(ActionItem, { alsoAllow: ['focused'] });

export default ActionItem;
