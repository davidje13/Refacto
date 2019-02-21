import React from 'react';
import classNames from 'classnames';
import forbidExtraProps from '../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../helpers/dataStructurePropTypes';

const ActionItem = ({
  item: {
    message,
    done = false,
  },
}) => (
  <div className={classNames('action-item', { done })}>
    {message}
  </div>
);

ActionItem.propTypes = {
  item: propTypesShapeItem.isRequired,
};

forbidExtraProps(ActionItem, { alsoAllow: ['focused'] });

export default ActionItem;
