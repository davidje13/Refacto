import React from 'react';
import PropTypes from 'prop-types';
import ItemColumn from './ItemColumn';
import ActionItem from './ActionItem';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../helpers/dataStructurePropTypes';

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
  range: {
    from = Number.NEGATIVE_INFINITY,
    to = Number.POSITIVE_INFINITY,
  },
}) => (
  <section>
    <h3>{title}</h3>
    <ItemColumn
      items={items.filter(actionItemWithinRange(from, to))}
      ItemType={ActionItem}
    />
  </section>
);

ActionSection.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  title: PropTypes.string.isRequired,
  range: PropTypes.shape({
    from: PropTypes.number,
    to: PropTypes.number,
  }).isRequired,
};

forbidExtraProps(ActionSection);

export default React.memo(ActionSection);
