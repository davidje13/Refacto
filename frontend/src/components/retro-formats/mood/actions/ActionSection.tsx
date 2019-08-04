import React from 'react';
import PropTypes from 'prop-types';
import { RetroItem } from 'refacto-entities';
import ActionItem from './ActionItem';
import ItemColumn from '../ItemColumn';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

function actionItemWithinRange(from: number, to: number) {
  return (item: RetroItem): boolean => (
    item.category === 'action' &&
    item.created >= from &&
    item.created < to
  );
}

interface PropsT {
  title: string;
  items: RetroItem[];
  rangeFrom: number;
  rangeTo: number;
  onSetDone?: (id: string, done: boolean) => void;
  onEdit?: (id: string, message: string) => void;
  onDelete?: (id: string) => void;
}

const ActionSection = ({
  title,
  items,
  rangeFrom,
  rangeTo,
  onSetDone,
  onEdit,
  onDelete,
}: PropsT): React.ReactElement => (
  <section>
    <header>
      <h3>{title}</h3>
    </header>
    <ItemColumn<React.ComponentPropsWithRef<typeof ActionItem>>
      items={items.filter(actionItemWithinRange(rangeFrom, rangeTo))}
      ItemType={ActionItem}
      itemProps={{
        onSetDone,
        onEdit,
        onDelete,
      }}
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
  onSetDone: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

forbidExtraProps(ActionSection);

export default React.memo(ActionSection);
