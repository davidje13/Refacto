import React from 'react';
import PropTypes from 'prop-types';
import ItemColumn from './ItemColumn';
import ActionItem from './ActionItem';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../helpers/dataStructurePropTypes';

const ActionSection = ({
  title,
  items,
}) => (
  <section>
    <h3>{title}</h3>
    <ItemColumn
      items={items.filter((item) => (item.category === 'action'))}
      ItemType={ActionItem}
    />
  </section>
);

ActionSection.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  title: PropTypes.string.isRequired,
};

ActionSection.defaultProps = {
};

forbidExtraProps(ActionSection);

export default ActionSection;
