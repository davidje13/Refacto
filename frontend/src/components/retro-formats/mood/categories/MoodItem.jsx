import React from 'react';
import PropTypes from 'prop-types';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditing from '../ItemEditing';
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
    onVote(item.id);
  };

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

  handleDelete = () => {
    const { item, onDelete } = this.props;
    onDelete(item.id);
  };

  handleSelect = () => {
    const { item, onSelect } = this.props;
    onSelect(item.id);
  };

  handleCancelFocus = () => {
    const { item, onCancel } = this.props;
    onCancel(item.id);
  };

  handleDone = () => {
    const { item, onDone } = this.props;
    onDone(item.id);
  };

  render() {
    const {
      item,
      focused,
      focusedItemTimeout,
      onVote,
      onEdit,
      onDelete,
      onSelect,
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
          onDelete={onDelete === null ? null : this.handleDelete}
        />
      );
    }

    if (focused) {
      return (
        <MoodItemFocused
          item={item}
          focusedItemTimeout={focusedItemTimeout}
          onAddExtraTime={onAddExtraTime}
          onCancel={this.handleCancelFocus}
          onDone={this.handleDone}
        />
      );
    }

    return (
      <MoodItemPlain
        item={item}
        onVote={onVote === null ? null : this.handleVote}
        onEdit={onEdit === null ? null : this.handleBeginEdit}
        onSelect={onSelect === null ? null : this.handleSelect}
      />
    );
  }
}

forbidExtraProps(MoodItem);

export default MoodItem;
