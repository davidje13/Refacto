import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ItemEditing from '../ItemEditing';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import { dynamicBind } from '../../../../helpers/dynamicBind';
import './ActionItem.less';

const addItemPath = (props) => [props.item.id];

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

    const { onSetDone, onDelete } = props;

    this.handleToggleDone = dynamicBind(this, { onSetDone }, ({ item }) => [item.id, !item.done]);
    this.handleDelete = dynamicBind(this, { onDelete }, addItemPath);
  }

  handleBeginEdit = () => {
    this.setState({ editing: true });
  };

  handleCancelEdit = () => {
    this.setState({ editing: false });
  };

  handleSaveEdit = (message) => {
    const { item, onEdit } = this.props;

    this.setState({ editing: false });
    onEdit(item.id, message);
  };

  render() {
    const { item, onEdit } = this.props;
    const { editing } = this.state;

    if (editing) {
      return (
        <ItemEditing
          className="action-item"
          message={item.message}
          onSubmit={this.handleSaveEdit}
          onCancel={this.handleCancelEdit}
          onDelete={this.handleDelete.optional()}
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
          disabled={!this.handleToggleDone.exists()}
          onClick={this.handleToggleDone.optional()}
        />
        { onEdit && (
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
