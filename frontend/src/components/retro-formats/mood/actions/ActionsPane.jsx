import React from 'react';
import PropTypes from 'prop-types';
import ActionSection from './ActionSection';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import LocalDateProvider from '../../../../time/LocalDateProvider';
import { formatDate } from '../../../../time/formatters';

export const ActionsPane = ({
  items,
  localDateProvider,
  onAddItem,
  onSetDone,
  onEdit,
  onDelete,
}) => {
  const today = localDateProvider.getMidnightTimestamp();
  const lastWeek = localDateProvider.getMidnightTimestamp(-7);

  return (
    <section className="actions">
      <header>
        <h2>Action items</h2>
        { onAddItem ? (
          <ExpandingTextEntry
            onSubmit={onAddItem}
            submitButtonTitle="Add"
            placeholder="Add an action item"
            clearAfterSubmit
          />
        ) : null }
      </header>
      <ActionSection
        items={items}
        title={`Today (${formatDate(today)})`}
        rangeFrom={today}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <ActionSection
        items={items}
        title="Past Week"
        rangeFrom={lastWeek}
        rangeTo={today}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <ActionSection
        items={items}
        title="Older"
        rangeTo={lastWeek}
        onSetDone={onSetDone}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
};

ActionsPane.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  localDateProvider: PropTypes.instanceOf(LocalDateProvider).isRequired,
  onAddItem: PropTypes.func,
  onSetDone: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ActionsPane.defaultProps = {
  onAddItem: null,
  onSetDone: null,
  onEdit: null,
  onDelete: null,
};

forbidExtraProps(ActionsPane);

export default React.memo(ActionsPane);
