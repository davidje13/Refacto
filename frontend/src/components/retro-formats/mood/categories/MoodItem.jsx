import React from 'react';
import PropTypes from 'prop-types';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditing from '../ItemEditing';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import { dynamicBind } from '../../../../helpers/dynamicBind';
import './MoodItem.less';

const addItemPath = (props) => [props.item.id];

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

    const {
      onVote,
      onDelete,
      onSelect,
      onCancel,
      onDone,
    } = props;

    this.handleVote = dynamicBind(this, { onVote }, addItemPath);
    this.handleDelete = dynamicBind(this, { onDelete }, addItemPath);
    this.handleSelect = dynamicBind(this, { onSelect }, addItemPath);
    this.handleCancel = dynamicBind(this, { onCancel }, addItemPath);
    this.handleDone = dynamicBind(this, { onDone }, addItemPath);
  }

  handleBeginEdit = () => {
    this.setState({ editing: true });
  };

  handleCancelEdit = () => {
    this.setState({ editing: false });
  };

  handleSaveEdit = (message) => {
    this.setState({ editing: false });

    const { item, onEdit } = this.props;
    onEdit(item.id, message);
  };

  render() {
    const {
      item,
      focused,
      focusedItemTimeout,
      onEdit,
      onAddExtraTime,
    } = this.props;

    const { editing } = this.state;

    if (editing) {
      return (
        <ItemEditing
          className="mood-item"
          message={item.message}
          onSubmit={this.handleSaveEdit}
          onCancel={this.handleCancelEdit}
          onDelete={this.handleDelete.optional()}
        />
      );
    }

    if (focused) {
      return (
        <MoodItemFocused
          item={item}
          focusedItemTimeout={focusedItemTimeout}
          onAddExtraTime={onAddExtraTime}
          onCancel={this.handleCancel.optional()}
          onDone={this.handleDone.optional()}
        />
      );
    }

    return (
      <MoodItemPlain
        item={item}
        onVote={this.handleVote.optional()}
        onEdit={onEdit ? this.handleBeginEdit : null}
        onSelect={this.handleSelect.optional()}
      />
    );
  }
}

forbidExtraProps(MoodItem);

export default MoodItem;
