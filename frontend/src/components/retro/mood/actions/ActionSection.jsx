import React from 'react';
import PropTypes from 'prop-types';
import ActionItem from './ActionItem';
import ItemColumn from '../ItemColumn';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';

function actionItemWithinRange(from, to) {
  return (item) => (
    item.category === 'action' &&
    item.created >= from &&
    item.created < to
  );
}

export const ActionSection = ({
  title,
  items,
  rangeFrom,
  rangeTo,
}) => (
  <section>
    <header>
      <h3>{title}</h3>
    </header>
    <ItemColumn
      items={items.filter(actionItemWithinRange(rangeFrom, rangeTo))}
      ItemType={ActionItem}
    />
  </section>
);

ActionSection.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  title: PropTypes.string.isRequired,
  rangeFrom: PropTypes.number,
  rangeTo: PropTypes.number,
};

ActionSection.defaultProps = {
  rangeFrom: Number.NEGATIVE_INFINITY,
  rangeTo: Number.POSITIVE_INFINITY,
};

forbidExtraProps(ActionSection);

export default React.memo(ActionSection);
