import React from 'react';
import PropTypes from 'prop-types';
import ActionItem from './ActionItem';
import ItemColumn from '../ItemColumn';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

function actionItemWithinRange(from, to) {
  return (item) => (
    item.category === 'action' &&
    item.created >= from &&
    item.created < to
  );
}

const ActionSection = ({
  title,
  items,
  rangeFrom,
  rangeTo,
  onSetDone,
  onEdit,
  onDelete,
}) => (
  <section>
    <header>
      <h3>{title}</h3>
    </header>
    <ItemColumn
      items={items.filter(actionItemWithinRange(rangeFrom, rangeTo))}
      ItemType={ActionItem}
      onSetDone={onSetDone}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </section>
);

ActionSection.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  title: PropTypes.string.isRequired,
  rangeFrom: PropTypes.number,
  rangeTo: PropTypes.number,
  onSetDone: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ActionSection.defaultProps = {
  rangeFrom: Number.NEGATIVE_INFINITY,
  rangeTo: Number.POSITIVE_INFINITY,
  onSetDone: null,
  onEdit: null,
  onDelete: null,
};

forbidExtraProps(ActionSection);

export default React.memo(ActionSection);
