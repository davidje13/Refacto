import React from 'react';
import PropTypes from 'prop-types';
import ItemColumn from './ItemColumn';
import MoodItem from './MoodItem';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../helpers/dataStructurePropTypes';

export const MoodSection = ({
  category,
  items,
  focusedItemUUID,
}) => (
  <section className={category}>
    <h3>{category}</h3>
    <ItemColumn
      items={items.filter((item) => (item.category === category))}
      ItemType={MoodItem}
      focusedItemUUID={focusedItemUUID}
    />
  </section>
);

MoodSection.propTypes = {
  category: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  focusedItemUUID: PropTypes.string,
};

MoodSection.defaultProps = {
  focusedItemUUID: null,
};

forbidExtraProps(MoodSection);

export default React.memo(MoodSection);
